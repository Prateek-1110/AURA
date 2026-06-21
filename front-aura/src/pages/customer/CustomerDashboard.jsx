import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../api/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const MOCK_BOOKINGS = [
  { booking_id: "bk1", service_type: "Balayage", salon_name: "Luminary Studio", date: "Sat, 28 Jun", time: "3:00 PM", status: "confirmed", price: 4500 },
  { booking_id: "bk2", service_type: "Keratin Treatment", salon_name: "The Mane Club", date: "Tue, 15 Jul", time: "11:00 AM", status: "pending", price: 6000 },
];

const MOCK_SAVED = [
  { id: 1, name: "Luminary Studio", city: "Indiranagar", rating: 4.9, service: "Balayage" },
  { id: 2, name: "Velvet & Veil", city: "HSR Layout", rating: 4.7, service: "Haircut" },
];

const statusStyle = {
  confirmed: "bg-teal-50 text-teal-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-500",
  completed: "bg-gray-50 text-gray-500",
};

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/bookings/me")
      .then(({ data }) => { setBookings(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => b.status !== "completed" && b.status !== "cancelled");
  const completed = bookings.filter(b => b.status === "completed");

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-5 py-8 w-full flex-1">

        {/* Welcome header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="section-label mb-1">Welcome back</p>
            <h1 className="font-display text-3xl text-charcoal">{user?.name?.split(" ")[0] || "Hey there"} 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your bookings and discover new looks.</p>
          </div>
          <Link to="/explore" className="hidden sm:flex items-center gap-2 bg-burgundy text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-dark transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Explore
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Upcoming", value: upcoming.length, color: "text-burgundy" },
            { label: "Completed", value: completed.length, color: "text-teal-600" },
            { label: "Saved salons", value: MOCK_SAVED.length, color: "text-charcoal" },
            { label: "Reviews given", value: 3, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: upcoming bookings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-charcoal text-sm">Upcoming Appointments</h2>
              <Link to="/customer/bookings" className="text-xs text-burgundy hover:underline">View all</Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" /></div>
            ) : upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-sm text-gray-400 mb-3">No upcoming appointments.</p>
                <Link to="/explore" className="text-sm text-burgundy hover:underline">Find a salon →</Link>
              </div>
            ) : (
              upcoming.map(b => (
                <Link key={b.booking_id} to={`/booking/confirmation/${b.booking_id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-burgundy/30 hover:shadow-glass transition group">
                  <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center text-burgundy text-xl flex-shrink-0">✂️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal truncate group-hover:text-burgundy transition">{b.service_type}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{b.salon_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.date} · {b.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${statusStyle[b.status] || "bg-gray-50 text-gray-400"}`}>
                      {b.status}
                    </span>
                    {b.price && <span className="text-xs text-gray-500">₹{b.price.toLocaleString()}</span>}
                  </div>
                </Link>
              ))
            )}

            {/* Quick actions */}
            <div>
              <h2 className="font-semibold text-charcoal text-sm mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: "/explore", icon: "🔍", title: "Browse Salons", sub: "Discover new looks" },
                  { to: "/customer/saved", icon: "❤️", title: "Saved Creators", sub: `${MOCK_SAVED.length} saved` },
                  { to: "/messages", icon: "💬", title: "Messages", sub: "2 unread" },
                  { to: "/customer/bookings", icon: "📅", title: "Booking History", sub: `${bookings.length} total` },
                ].map(q => (
                  <Link key={q.to} to={q.to}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-burgundy/30 hover:shadow-glass transition group">
                    <span className="text-2xl block mb-2">{q.icon}</span>
                    <p className="font-medium text-sm text-charcoal group-hover:text-burgundy transition">{q.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{q.sub}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400">Customer</p>
                </div>
              </div>
              <Link to="/settings" className="block w-full text-center border border-gray-200 text-charcoal text-sm py-2 rounded-xl hover:bg-gray-50 transition">
                Edit profile
              </Link>
            </div>

            {/* Saved creators preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-charcoal text-sm">Saved Creators</h3>
                <Link to="/customer/saved" className="text-xs text-burgundy hover:underline">See all</Link>
              </div>
              {MOCK_SAVED.map(s => (
                <Link key={s.id} to={`/salon/${s.id}`}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:opacity-80 transition">
                  <div className="w-8 h-8 rounded-lg bg-burgundy/10 flex items-center justify-center text-burgundy font-display text-sm flex-shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.city}</p>
                  </div>
                  <span className="text-xs text-amber-500 font-semibold">★{s.rating}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
