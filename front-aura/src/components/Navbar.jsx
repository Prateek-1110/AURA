import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import NotificationPanel from "./NotificationPanel";

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const isCreator = user?.role === "creator";

  const customerLinks = [
    { to: "/explore", label: "Discover" },
    { to: "/customer/saved", label: "Saved" },
    { to: "/customer/bookings", label: "Bookings" },
    { to: "/messages", label: "Messages" },
  ];

  const creatorLinks = [
    { to: "/creator/dashboard", label: "Dashboard" },
    { to: "/creator/bookings", label: "Bookings" },
    { to: "/creator/portfolio", label: "Portfolio" },
    { to: "/creator/earnings", label: "Earnings" },
  ];

  const links = user ? (isCreator ? creatorLinks : customerLinks) : [];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? (isCreator ? "/creator/dashboard" : "/explore") : "/"} className="font-display text-xl text-charcoal tracking-tight">
            AURA
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname.startsWith(l.to)
                    ? "bg-burgundy/8 text-burgundy"
                    : "text-gray-500 hover:text-charcoal hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-burgundy rounded-full" />
                  )}
                </button>

                {/* Avatar menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="w-9 h-9 rounded-xl bg-burgundy text-white text-sm font-bold flex items-center justify-center hover:bg-burgundy-dark transition"
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-1.5 animate-scale-in">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-charcoal truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                      {isCreator ? (
                        <>
                          <Link to="/creator/profile" className="menu-item" onClick={() => setMenuOpen(false)}>Edit Profile</Link>
                          <Link to="/creator/analytics" className="menu-item" onClick={() => setMenuOpen(false)}>Analytics</Link>
                          <Link to="/creator/reviews" className="menu-item" onClick={() => setMenuOpen(false)}>Reviews</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/customer/dashboard" className="menu-item" onClick={() => setMenuOpen(false)}>My Dashboard</Link>
                          <Link to="/customer/saved" className="menu-item" onClick={() => setMenuOpen(false)}>Saved Creators</Link>
                        </>
                      )}
                      <Link to="/settings" className="menu-item" onClick={() => setMenuOpen(false)}>Settings</Link>
                      <button onClick={handleLogout} className="menu-item text-left w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-500 hover:text-charcoal px-3 py-1.5 transition">Sign in</Link>
                <Link to="/register" className="text-sm bg-burgundy text-white px-4 py-2 rounded-xl font-medium hover:bg-burgundy-dark transition">
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500 ml-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile links (inside nav) */}
        {menuOpen && user && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1 bg-cream">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  location.pathname.startsWith(l.to)
                    ? "bg-burgundy/8 text-burgundy"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Notification Panel */}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}

      {/* Backdrop for notif */}
      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}

      <style>{`.menu-item { display: block; padding: 0.5rem 1rem; font-size: 0.875rem; color: #4B5563; transition: all 0.1s; } .menu-item:hover { background: #FAF7F4; color: #2D2D2D; }`}</style>
    </>
  );
}
