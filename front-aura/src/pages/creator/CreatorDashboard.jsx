import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";
import api from "../../api/axios";
import SalonSetupForm from "../../components/SalonSetupForm";

const MOCK_STATS = { bookings_this_month: 14, earnings_this_month: 52800, rating: 4.9, total_reviews: 68, pending_requests: 3, transformation_count: 34 };
const MOCK_RECENT = [
  { id: "bk1", customer: "Meera R.", service: "Signature Balayage", date: "Sat, 28 Jun", time: "3 PM", status: "pending", price: 4500 },
  { id: "bk2", customer: "Ananya K.", service: "Keratin Treatment", date: "Mon, 30 Jun", time: "11 AM", status: "confirmed", price: 6000 },
  { id: "bk3", customer: "Divya S.", service: "Precision Haircut", date: "Wed, 2 Jul", time: "2 PM", status: "confirmed", price: 800 },
];

const statusStyle = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-teal-50 text-teal-700",
  cancelled: "bg-red-50 text-red-500",
  completed: "bg-gray-50 text-gray-500",
};

function StatCard({ icon, label, value, sub, color = "text-burgundy" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`font-display text-3xl ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-charcoal mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CreatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [loadingSalon, setLoadingSalon] = useState(true);
  const [videos, setVideos] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    api.get("/upload/salon/me")
      .then(({ data }) => setSalon(data))
      .catch(() => setSalon(null))
      .finally(() => setLoadingSalon(false));

    api.get("/virality/videos")
      .then(({ data }) => setVideos(data))
      .catch(() => {});

    api.get("/bookings/me")
      .then(({ data }) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, []);

  async function handleAccept(bookingId) {
    try {
      await api.patch(`/bookings/${bookingId}/accept`);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "confirmed" } : b));
    } catch {}
  }

  async function handleReject(bookingId) {
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    } catch {}
  }

  const bookingsThisMonth = bookings.filter(b => b.status !== "cancelled").length;
  const earningsThisMonth = bookings.reduce((sum, b) => (b.status === "completed" || b.status === "confirmed") ? sum + (b.price || 0) : sum, 0);
  const pendingRequests = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar + content layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0">
          <div className="p-5 border-b border-gray-100">
            <p className="font-display text-xl text-charcoal">AURA</p>
            <p className="text-xs text-gray-400 mt-0.5">Creator Studio</p>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {[
              ["🏠", "Dashboard", "/creator/dashboard"],
              ["📅", "Bookings", "/creator/bookings"],
              ["🖼️", "Portfolio", "/creator/portfolio"],
              ["🛎️", "Services", "/creator/services"],
              ["📆", "Availability", "/creator/availability"],
              ["💰", "Earnings", "/creator/earnings"],
              ["📊", "Analytics", "/creator/analytics"],
              ["⭐", "Reviews", "/creator/reviews"],
              ["👤", "Edit Profile", "/creator/profile"],
              ["📤", "Upload", "/creator/upload"],
            ].map(([icon, label, to]) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                  window.location.pathname === to
                    ? "bg-burgundy/8 text-burgundy font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-charcoal"
                }`}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-burgundy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-charcoal truncate">{user?.name}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full mt-1 text-xs text-gray-400 hover:text-red-500 transition px-3 py-1.5 text-left rounded-xl hover:bg-red-50">
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content (offset for sidebar on desktop) */}
        <div className="flex-1 lg:ml-56">
          {/* Mobile nav */}
          <div className="lg:hidden sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
            <p className="font-display text-lg text-charcoal">Studio</p>
            <div className="flex gap-2">
              <Link to="/creator/upload" className="text-xs bg-burgundy text-white px-3 py-1.5 rounded-lg">Upload</Link>
              <button onClick={logout} className="text-xs text-gray-400">Sign out</button>
            </div>
          </div>

          <div className="px-5 lg:px-8 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>

            {/* Salon setup prompt */}
            {loadingSalon ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 animate-pulse">
                <div className="h-5 w-48 bg-gray-100 rounded mb-3" />
                <div className="h-4 w-64 bg-gray-100 rounded" />
              </div>
            ) : !salon ? (
              <div className="mb-6">
                <SalonSetupForm onCreated={data => setSalon(data)} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Your studio</p>
                  <p className="font-display text-lg text-charcoal">{salon.name}</p>
                  <p className="text-xs text-gray-400">{salon.neighborhood ? `${salon.neighborhood}, ` : ""}{salon.city}</p>
                </div>
                <Link to={`/salon/${salon.id}`} className="text-xs text-burgundy hover:underline">View public profile →</Link>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <StatCard icon="📅" label="Bookings this month" value={bookingsThisMonth} sub="Active appointments" />
              <StatCard icon="💰" label="Earnings this month" value={`₹${earningsThisMonth.toLocaleString()}`} sub="Confirmed & completed" color="text-teal-600" />
              <StatCard icon="⭐" label="Rating" value="4.9" sub="68 reviews" color="text-amber-500" />
              <StatCard icon="⏳" label="Pending requests" value={pendingRequests} sub="Need action" color="text-amber-600" />
              <StatCard icon="🖼️" label="Portfolio looks" value={salon?.transformation_count || 0} sub="Live on public profile" color="text-charcoal" />
              <StatCard icon="🎬" label="Videos" value={videos.length} sub="Published & drafts" color="text-charcoal" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending bookings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-charcoal text-sm">Incoming Requests</h2>
                  <Link to="/creator/bookings" className="text-xs text-burgundy hover:underline">View all</Link>
                </div>
                <div className="space-y-2">
                  {loadingBookings ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-xs">
                      Loading bookings...
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-xs">
                      No incoming booking requests.
                    </div>
                  ) : (
                    bookings.slice(0, 3).map(b => (
                      <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm text-charcoal">{b.customer}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{b.service_type}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{b.date} · {b.time}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${statusStyle[b.status] || "bg-gray-50 text-gray-400"}`}>{b.status}</span>
                            <p className="text-xs text-charcoal font-semibold mt-1">₹{(b.price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        {b.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleAccept(b.id)}
                              className="flex-1 text-xs bg-teal-500 text-white py-1.5 rounded-lg hover:bg-teal-600 transition font-medium">
                              Accept
                            </button>
                            <button onClick={() => handleReject(b.id)}
                              className="flex-1 text-xs border border-red-200 text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition font-medium">
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div>
                <h2 className="font-semibold text-charcoal text-sm mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { to: "/creator/upload", icon: "📷", title: "Upload Look", sub: "Before / After" },
                    { to: "/creator/services", icon: "🛎️", title: "Add Service", sub: "Set pricing" },
                    { to: "/creator/availability", icon: "📆", title: "Set Availability", sub: "Calendar" },
                    { to: "/creator/analytics", icon: "📊", title: "Analytics", sub: "Video virality" },
                  ].map(q => (
                    <Link key={q.to} to={q.to}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-burgundy/30 hover:shadow-glass transition group">
                      <span className="text-2xl block mb-2">{q.icon}</span>
                      <p className="font-medium text-sm text-charcoal group-hover:text-burgundy transition">{q.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{q.sub}</p>
                    </Link>
                  ))}
                </div>

                {/* Videos list */}
                {videos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold text-charcoal text-sm">Recent Videos</h2>
                      <Link to="/creator/analytics" className="text-xs text-burgundy hover:underline">View all</Link>
                    </div>
                    {videos.slice(0, 3).map(v => (
                      <Link key={v.id} to={`/creator/video/${v.id}`}
                        className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 mb-2 hover:border-burgundy/30 transition group">
                        <span className="text-lg">🎬</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal truncate group-hover:text-burgundy transition">{v.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{v.status}</p>
                        </div>
                        {v.virality_score != null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            v.virality_score >= 75 ? "bg-teal-100 text-teal-700" :
                            v.virality_score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                          }`}>{v.virality_score.toFixed(0)}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
