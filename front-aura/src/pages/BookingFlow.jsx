import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../api/AuthContext";
import Navbar from "../components/Navbar";

const SERVICES = [
  { id: 1, name: "Signature Balayage", duration: "3 hrs", price: 4500 },
  { id: 2, name: "Global Hair Color", duration: "2 hrs", price: 2800 },
  { id: 3, name: "Keratin Treatment", duration: "2.5 hrs", price: 6000 },
  { id: 4, name: "Precision Haircut", duration: "45 min", price: 800 },
];

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const DAYS = (() => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push(d);
  }
  return days;
})();

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
            i < current ? "bg-burgundy text-white" :
            i === current ? "bg-burgundy text-white ring-2 ring-burgundy/30" :
            "bg-gray-100 text-gray-400"
          }`}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-8 transition ${i < current ? "bg-burgundy" : "bg-gray-100"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function BookingFlow() {
  const { salonId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, addNotification } = useAuth();

  const salon = state?.salon || { name: "Luminary Studio", city: "Bangalore" };
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({
    service: state?.service || null,
    date: null,
    timeSlot: null,
    notes: "",
    paymentMethod: "upi",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const STEPS = ["Service", "Date & Time", "Details", "Payment"];
  const canNext = [
    !!selected.service,
    !!(selected.date && selected.timeSlot),
    true,
    true,
  ];

  async function confirmBooking() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        salon_id: salonId,
        service_name: selected.service?.name,
        service_price: selected.service?.price,
        date: selected.date?.toISOString(),
        time_slot: selected.timeSlot,
        notes: selected.notes,
        payment_method: selected.paymentMethod,
      };
      const { data } = await api.post("/bookings", payload);
      addNotification({ text: `Booking at ${salon.name} confirmed!`, type: "booking" });
      navigate(`/booking/confirmation/${data.booking_id || "new"}`, {
        state: { salon, service: selected.service, date: selected.date, timeSlot: selected.timeSlot },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-lg mx-auto px-5 py-8 w-full flex-1">
        {/* Salon header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/salon/${salonId}`} className="text-gray-400 hover:text-charcoal transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-display text-xl text-charcoal">{salon.name}</h1>
            <p className="text-xs text-gray-400">{salon.neighborhood ? `${salon.neighborhood}, ` : ""}{salon.city}</p>
          </div>
        </div>

        <StepIndicator current={step} total={STEPS.length} />
        <h2 className="font-display text-2xl text-charcoal mb-5">{STEPS[step]}</h2>

        {/* Step 0: Service selection */}
        {step === 0 && (
          <div className="space-y-3">
            {SERVICES.map(svc => (
              <button key={svc.id} onClick={() => setSelected(s => ({ ...s, service: svc }))}
                className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                  selected.service?.id === svc.id ? "border-burgundy bg-burgundy/5" : "border-gray-200 bg-white hover:border-burgundy/40"
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal text-sm">{svc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{svc.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal">₹{svc.price.toLocaleString()}</p>
                    {selected.service?.id === svc.id && (
                      <span className="text-xs text-burgundy">Selected ✓</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select date</p>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
              {DAYS.map(d => {
                const isSelected = selected.date?.toDateString() === d.toDateString();
                return (
                  <button key={d.toDateString()} onClick={() => setSelected(s => ({ ...s, date: d, timeSlot: null }))}
                    className={`flex-shrink-0 w-14 py-2.5 rounded-xl text-center transition border ${
                      isSelected ? "bg-burgundy text-white border-burgundy" : "bg-white border-gray-200 hover:border-burgundy/40"
                    }`}>
                    <p className="text-xs font-medium">{d.toLocaleDateString("en", { weekday: "short" })}</p>
                    <p className={`text-lg font-display ${isSelected ? "text-white" : "text-charcoal"}`}>{d.getDate()}</p>
                    <p className="text-xs opacity-70">{d.toLocaleDateString("en", { month: "short" })}</p>
                  </button>
                );
              })}
            </div>

            {selected.date && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select time</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setSelected(s => ({ ...s, timeSlot: slot }))}
                      className={`py-2.5 rounded-xl text-sm transition border ${
                        selected.timeSlot === slot ? "bg-burgundy text-white border-burgundy" : "bg-white border-gray-200 hover:border-burgundy/40 text-charcoal"
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Details / Notes */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Service</span>
                <span className="font-medium text-charcoal">{selected.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="font-medium text-charcoal">
                  {selected.date?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span className="font-medium text-charcoal">{selected.timeSlot}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium text-charcoal">{selected.service?.duration}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Special requests (optional)</label>
              <textarea value={selected.notes} onChange={e => setSelected(s => ({ ...s, notes: e.target.value }))}
                rows={3} placeholder="Allergies, specific preferences, reference photos..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy resize-none transition" />
            </div>

            <div className="bg-cream-dark rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
              📌 Free cancellation up to 24 hours before your appointment. After that, a 50% cancellation fee applies.
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{selected.service?.name}</span>
                  <span className="text-charcoal">₹{selected.service?.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Platform fee</span>
                  <span>₹0 (waived)</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-charcoal">
                  <span>Total</span>
                  <span>₹{selected.service?.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Payment method</p>
              <div className="space-y-2">
                {[["upi", "📱", "UPI / Google Pay / PhonePe"], ["card", "💳", "Credit / Debit Card"], ["cash", "💵", "Pay at Salon"]].map(([val, icon, label]) => (
                  <button key={val} onClick={() => setSelected(s => ({ ...s, paymentMethod: val }))}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition text-left ${
                      selected.paymentMethod === val ? "border-burgundy bg-burgundy/5" : "border-gray-200 bg-white hover:border-burgundy/40"
                    }`}>
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium text-charcoal">{label}</span>
                    {selected.paymentMethod === val && <span className="ml-auto text-burgundy text-sm">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 border border-gray-200 text-charcoal py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext[step]}
              className="flex-1 bg-burgundy text-white py-3 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-40">
              Continue
            </button>
          ) : (
            <button onClick={confirmBooking} disabled={loading}
              className="flex-1 bg-burgundy text-white py-3 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Confirming...
                </span>
              ) : `Confirm Booking · ₹${selected.service?.price.toLocaleString()}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
