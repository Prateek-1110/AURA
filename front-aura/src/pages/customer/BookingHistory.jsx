import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const MOCK_BOOKINGS = [
  { booking_id: "bk1", service_type: "Balayage", salon_name: "Luminary Studio", salon_id: 1, date: "Sat, 28 Jun 2025", time: "3:00 PM", status: "confirmed", price: 4500, can_review: false },
  { booking_id: "bk2", service_type: "Keratin Treatment", salon_name: "The Mane Club", salon_id: 2, date: "Tue, 15 Jul 2025", time: "11:00 AM", status: "pending", price: 6000, can_review: false },
  { booking_id: "bk3", service_type: "Precision Haircut", salon_name: "Velvet & Veil", salon_id: 3, date: "Mon, 2 Jun 2025", time: "4:00 PM", status: "completed", price: 800, can_review: true },
  { booking_id: "bk4", service_type: "Highlights", salon_name: "Luminary Studio", salon_id: 1, date: "Fri, 16 May 2025", time: "12:00 PM", status: "completed", price: 3200, can_review: false },
  { booking_id: "bk5", service_type: "Hair Color", salon_name: "The Mane Club", salon_id: 2, date: "Thu, 1 May 2025", time: "2:00 PM", status: "cancelled", price: 2800, can_review: false },
];

const statusStyle = {
  confirmed: "bg-teal-50 text-teal-700 border-teal-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  cancelled: "bg-red-50 text-red-500 border-red-100",
  completed: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"];

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/bookings/me")
      .then(({ data }) => { setBookings(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function cancelBooking(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: "cancelled" } : b));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel booking");
    }
  }

  const filtered = bookings.filter(b => {
    if (filter === "All") return true;
    if (filter === "Upcoming") return b.status === "confirmed" || b.status === "pending";
    if (filter === "Completed") return b.status === "completed";
    if (filter === "Cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-charcoal">Booking History</h1>
          <p className="text-gray-400 text-sm mt-1">{bookings.length} appointments total</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                filter === f ? "bg-burgundy text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-burgundy/40"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm text-gray-400">No {filter.toLowerCase()} bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.booking_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-burgundy/8 flex items-center justify-center text-burgundy text-xl flex-shrink-0">✂️</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-charcoal">{b.service_type}</p>
                        <Link to={`/salon/${b.salon_id}`} className="text-xs text-burgundy hover:underline mt-0.5 block">{b.salon_name}</Link>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize flex-shrink-0 ${statusStyle[b.status] || "bg-gray-50 text-gray-400 border-gray-100"}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>📅 {b.date}</span>
                      <span>⏰ {b.time}</span>
                      {b.price && <span className="font-medium text-charcoal ml-auto">₹{b.price.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <Link to={`/booking/confirmation/${b.booking_id}`}
                    className="text-xs text-gray-500 hover:text-charcoal transition">View details</Link>
                  {(b.status === "confirmed" || b.status === "pending") && (
                    <button onClick={() => cancelBooking(b.booking_id)}
                      className="text-xs text-red-400 hover:text-red-600 transition ml-2">Cancel booking</button>
                  )}
                  {b.can_review && (
                    <Link to={`/salon/${b.salon_id}?tab=reviews`}
                      className="ml-auto text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition font-medium">
                      ★ Leave review
                    </Link>
                  )}
                  {b.status === "completed" && !b.can_review && (
                    <Link to={`/salon/${b.salon_id}`}
                      className="ml-auto text-xs bg-burgundy/8 text-burgundy px-3 py-1.5 rounded-lg hover:bg-burgundy/15 transition font-medium">
                      Book again
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
