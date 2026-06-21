import { useState, useEffect } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

const MOCK_BOOKINGS = [
  { id: "bk1", customer: "Meera R.", customer_avatar: "M", service: "Signature Balayage", date: "Sat, 28 Jun 2025", time: "3:00 PM", price: 4500, status: "pending", notes: "I have fine hair, please use lighter products.", created_at: "2 hours ago" },
  { id: "bk2", customer: "Ananya K.", customer_avatar: "A", service: "Keratin Treatment", date: "Mon, 30 Jun 2025", time: "11:00 AM", price: 6000, status: "confirmed", notes: "", created_at: "Yesterday" },
  { id: "bk3", customer: "Divya S.", customer_avatar: "D", service: "Precision Haircut", date: "Wed, 2 Jul 2025", time: "2:00 PM", price: 800, status: "confirmed", notes: "Shoulder length bob, reference photo sent via message.", created_at: "2 days ago" },
  { id: "bk4", customer: "Sneha P.", customer_avatar: "S", service: "Hair Color", date: "Fri, 4 Jul 2025", time: "4:00 PM", price: 2800, status: "pending", notes: "", created_at: "3 days ago" },
  { id: "bk5", customer: "Priya M.", customer_avatar: "P", service: "Balayage", date: "Mon, 16 Jun 2025", time: "10:00 AM", price: 4500, status: "completed", notes: "", created_at: "2 weeks ago" },
];

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  confirmed: "bg-teal-50 text-teal-700 border border-teal-100",
  cancelled: "bg-red-50 text-red-500 border border-red-100",
  completed: "bg-gray-50 text-gray-500 border border-gray-200",
};

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/bookings/me")
      .then(({ data }) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateStatus(id, status) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    let endpoint = "reject";
    if (status === "confirmed") endpoint = "accept";
    else if (status === "completed") endpoint = "complete";
    api.patch(`/bookings/${id}/${endpoint}`).catch(() => {});
  }

  const filtered = bookings.filter(b =>
    filter === "All" || b.status.toLowerCase() === filter.toLowerCase()
  );

  const pending = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-charcoal">Bookings</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-400 text-sm">{bookings.length} total</p>
            {pending > 0 && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
                {pending} pending action
              </span>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                filter === f ? "bg-burgundy text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-burgundy/40"
              }`}>
              {f}
              {f === "Pending" && pending > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-xs font-bold">{pending}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No {filter.toLowerCase()} bookings.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${
                b.status === "pending" ? "border-amber-200" : "border-gray-100"
              }`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {b.customer_avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-charcoal text-sm">{b.customer}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{b.service_type || b.service}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${statusStyle[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                      <span>📅 {b.date}</span>
                      <span>⏰ {b.time}</span>
                      <span className="font-semibold text-charcoal">₹{(b.price || 0).toLocaleString()}</span>
                    </div>

                    {b.notes && (
                      <div className="mt-2 bg-cream rounded-lg px-3 py-2 text-xs text-gray-500 leading-relaxed">
                        💬 {b.notes}
                      </div>
                    )}
                  </div>
                </div>

                {b.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => updateStatus(b.id, "confirmed")}
                      className="flex-1 bg-teal-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition">
                      ✓ Accept
                    </button>
                    <button onClick={() => updateStatus(b.id, "cancelled")}
                      className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                      ✕ Decline
                    </button>
                  </div>
                )}

                {b.status === "confirmed" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => updateStatus(b.id, "completed")}
                      className="text-xs bg-charcoal/5 text-charcoal px-3 py-1.5 rounded-lg hover:bg-charcoal/10 transition font-medium">
                      Mark completed
                    </button>
                    <button onClick={() => updateStatus(b.id, "cancelled")}
                      className="text-xs text-red-400 hover:text-red-600 transition ml-auto">
                      Cancel
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-300 mt-2">{b.created_at}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
