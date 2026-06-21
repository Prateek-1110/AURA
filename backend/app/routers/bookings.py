from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Booking, Transformation, Salon
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _serialize(booking: Booking, transformation: Transformation, salon: Salon) -> dict:
    return {
        "booking_id": booking.id,
        "id": booking.id,
        "status": booking.status,
        "booked_at": booking.booked_at.isoformat() if booking.booked_at else None,
        "date": booking.booked_at.strftime("%a, %d %b %Y") if booking.booked_at else "",
        "time": booking.time_slot or "",
        "time_slot": booking.time_slot or "",
        "notes": booking.notes or "",
        "payment_method": booking.payment_method or "",
        "price": booking.price or 0.0,
        "salon_id": salon.id,
        "salon_name": salon.name,
        "transformation_id": transformation.id if transformation else None,
        "service_type": transformation.service_type if transformation else "Hair Service",
        "artist_name": transformation.artist_name if transformation else "",
        "after_image_url": transformation.after_image_url if transformation else "",
        "hair_texture_tag": transformation.hair_texture_tag if transformation else "",
        "customer_name": booking.customer.name if booking.customer else "Unknown",
        "customer": booking.customer.name if booking.customer else "Unknown",
        "customer_avatar": booking.customer.name[0] if booking.customer and booking.customer.name else "U",
    }


@router.get("/me")
def get_my_bookings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role == "creator":
        # Find salon owned by creator
        salon = db.query(Salon).filter(Salon.owner_id == user.id).first()
        if not salon:
            return []
        rows = (
            db.query(Booking, Transformation, Salon)
            .join(Transformation, Booking.transformation_id == Transformation.id)
            .join(Salon, Booking.salon_id == Salon.id)
            .filter(Booking.salon_id == salon.id)
            .order_by(Booking.booked_at.desc())
            .all()
        )
    else: # customer
        rows = (
            db.query(Booking, Transformation, Salon)
            .join(Transformation, Booking.transformation_id == Transformation.id)
            .join(Salon, Booking.salon_id == Salon.id)
            .filter(Booking.customer_id == user.id)
            .order_by(Booking.booked_at.desc())
            .all()
        )
    return [_serialize(b, t, s) for b, t, s in rows]


@router.get("/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role == "creator":
        salon = db.query(Salon).filter(Salon.owner_id == user.id).first()
        if not salon:
            raise HTTPException(status_code=403, detail="Not authorized")
        row = (
            db.query(Booking, Transformation, Salon)
            .join(Transformation, Booking.transformation_id == Transformation.id)
            .join(Salon, Booking.salon_id == Salon.id)
            .filter(Booking.id == booking_id, Booking.salon_id == salon.id)
            .first()
        )
    else: # customer
        row = (
            db.query(Booking, Transformation, Salon)
            .join(Transformation, Booking.transformation_id == Transformation.id)
            .join(Salon, Booking.salon_id == Salon.id)
            .filter(Booking.id == booking_id, Booking.customer_id == user.id)
            .first()
        )
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _serialize(*row)


from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    salon_id: int
    service_name: Optional[str] = None
    service_price: Optional[float] = None
    date: Optional[str] = None  # ISO date string
    time_slot: Optional[str] = None
    notes: Optional[str] = None
    payment_method: Optional[str] = "upi"

@router.post("", status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can book appointments")

    salon_id = payload.salon_id
    salon = db.query(Salon).filter(Salon.id == salon_id).first()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")

    transformation = None
    if payload.service_name:
        transformation = (
            db.query(Transformation)
            .filter(
                Transformation.salon_id == salon_id,
                Transformation.service_type.ilike(f"%{payload.service_name}%")
            )
            .first()
        )
    
    if not transformation:
        transformation = db.query(Transformation).filter(Transformation.salon_id == salon_id).first()

    if not transformation:
        raise HTTPException(
            status_code=400,
            detail="Salon has no transformations in its portfolio. Cannot complete booking."
        )

    booked_date = datetime.utcnow()
    if payload.date:
        try:
            clean_date = payload.date.replace("Z", "+00:00")
            booked_date = datetime.fromisoformat(clean_date)
        except ValueError:
            pass

    booking = Booking(
        customer_id=user.id,
        transformation_id=transformation.id,
        salon_id=salon_id,
        status="pending",
        booked_at=booked_date,
        notes=payload.notes,
        payment_method=payload.payment_method,
        time_slot=payload.time_slot,
        price=payload.service_price,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return _serialize(booking, transformation, salon)


@router.patch("/{booking_id}/accept")
def accept_booking(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if user.role != "creator" or booking.salon.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this booking")

    booking.status = "confirmed"
    db.commit()
    return {"booking_id": booking.id, "status": "confirmed"}


@router.patch("/{booking_id}/reject")
def reject_booking(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if user.role == "creator" and booking.salon.owner_id == user.id:
        booking.status = "cancelled"
    elif user.role == "customer" and booking.customer_id == user.id:
        booking.status = "cancelled"
    else:
        raise HTTPException(status_code=403, detail="Not authorized to decline this booking")

    db.commit()
    return {"booking_id": booking.id, "status": "cancelled"}


@router.patch("/{booking_id}/complete")
def complete_booking(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if user.role != "creator" or booking.salon.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this booking")

    booking.status = "completed"
    db.commit()
    return {"booking_id": booking.id, "status": "completed"}
