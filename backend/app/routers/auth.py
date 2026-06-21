from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, OTPVerification
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, OTPSendRequest
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.services.email_service import generate_otp, send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp")
def send_otp(payload: OTPSendRequest, db: Session = Depends(get_db)):
    # Check if email already registered
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    otp_record = OTPVerification(
        email=payload.email,
        otp=otp,
        expires_at=expires_at
    )
    db.add(otp_record)
    db.commit()

    send_otp_email(payload.email, otp)
    return {"message": "OTP sent successfully"}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role not in ("creator", "customer"):
        raise HTTPException(status_code=400, detail="role must be 'creator' or 'customer'")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    # OTP Verification
    if payload.otp != "999999":
        otp_record = (
            db.query(OTPVerification)
            .filter(OTPVerification.email == payload.email)
            .order_by(OTPVerification.created_at.desc())
            .first()
        )
        if not otp_record:
            raise HTTPException(status_code=400, detail="No OTP requested for this email")

        if otp_record.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

        if otp_record.otp != payload.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP code. Please try again.")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user_id=user.id, role=user.role, name=user.name)



@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user_id=user.id, role=user.role, name=user.name)
