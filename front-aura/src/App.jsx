import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./api/AuthContext";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import SalonProfile from "./pages/SalonProfile";
import BookingConfirmation from "./pages/BookingConfirmation";

// Shared
import BookingFlow from "./pages/BookingFlow";
import Settings from "./pages/Settings";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookingHistory from "./pages/customer/BookingHistory";
import SavedCreators from "./pages/customer/SavedCreators";
import Messages from "./pages/customer/Messages";

// Creator pages
import CreatorOnboarding from "./pages/creator/CreatorOnboarding";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import PortfolioManager from "./pages/creator/PortfolioManager";
import ServicesManager from "./pages/creator/ServicesManager";
import AvailabilityCalendar from "./pages/creator/AvailabilityCalendar";
import BookingManagement from "./pages/creator/BookingManagement";
import EarningsDashboard from "./pages/creator/EarningsDashboard";
import Analytics from "./pages/creator/Analytics";
import ReviewsManagement from "./pages/creator/ReviewsManagement";
import ProfileEditor from "./pages/creator/ProfileEditor";
import ContentUpload from "./pages/creator/ContentUpload";
import ViralityDashboard from "./pages/creator/ViralityDashboard";

// Protected route wrapper
function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "creator" ? "/creator/dashboard" : "/explore"} replace />;
  }

  return children;
}

// Public-only route (redirect logged-in users)
function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === "creator" ? "/creator/dashboard" : "/explore"} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/salon/:salonId" element={<SalonProfile />} />

      {/* Auth */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

      {/* Creator onboarding (creator only, no dashboard redirect yet) */}
      <Route path="/creator/onboarding" element={
        <ProtectedRoute role="creator"><CreatorOnboarding /></ProtectedRoute>
      } />

      {/* Shared protected */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

      {/* Booking flow */}
      <Route path="/booking/:salonId" element={<ProtectedRoute role="customer"><BookingFlow /></ProtectedRoute>} />
      <Route path="/booking/confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />

      {/* Customer routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute role="customer"><BookingHistory /></ProtectedRoute>} />
      <Route path="/customer/saved" element={<ProtectedRoute role="customer"><SavedCreators /></ProtectedRoute>} />

      {/* Creator routes */}
      <Route path="/creator/dashboard" element={<ProtectedRoute role="creator"><CreatorDashboard /></ProtectedRoute>} />
      <Route path="/creator/portfolio" element={<ProtectedRoute role="creator"><PortfolioManager /></ProtectedRoute>} />
      <Route path="/creator/services" element={<ProtectedRoute role="creator"><ServicesManager /></ProtectedRoute>} />
      <Route path="/creator/availability" element={<ProtectedRoute role="creator"><AvailabilityCalendar /></ProtectedRoute>} />
      <Route path="/creator/bookings" element={<ProtectedRoute role="creator"><BookingManagement /></ProtectedRoute>} />
      <Route path="/creator/earnings" element={<ProtectedRoute role="creator"><EarningsDashboard /></ProtectedRoute>} />
      <Route path="/creator/analytics" element={<ProtectedRoute role="creator"><Analytics /></ProtectedRoute>} />
      <Route path="/creator/reviews" element={<ProtectedRoute role="creator"><ReviewsManagement /></ProtectedRoute>} />
      <Route path="/creator/profile" element={<ProtectedRoute role="creator"><ProfileEditor /></ProtectedRoute>} />
      <Route path="/creator/upload" element={<ProtectedRoute role="creator"><ContentUpload /></ProtectedRoute>} />
      <Route path="/creator/video/:videoId" element={<ProtectedRoute role="creator"><ViralityDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-5">
      <p className="font-display text-8xl text-gray-100 mb-2">404</p>
      <h1 className="font-display text-2xl text-charcoal mb-2">Page not found</h1>
      <p className="text-gray-400 text-sm mb-6">This page doesn't exist or has moved.</p>
      <a
        href={user ? (user.role === "creator" ? "/creator/dashboard" : "/explore") : "/"}
        className="bg-burgundy text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-dark transition"
      >
        Go home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
