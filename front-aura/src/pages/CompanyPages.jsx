import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-12 flex-1 w-full animate-fade-in">
        <h1 className="font-display text-4xl text-charcoal mb-6 font-bold">About AURA</h1>
        <div className="prose text-gray-600 space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to AURA, an AI-powered hair salon discovery and booking platform. We bridge the gap between hair creators (artists) and customers, making the exploration of new styles and hair transformations seamless and visually stunning.
          </p>
          <p>
            Our core innovation is a video virality and visual transformation simulation system. Creators can showcase before & after portfolio looks, while customers can discover talent based on actual reviews, location, and specific services.
          </p>
          <p>
            We are dedicated to building a trusted community of creators and users in Bangalore and beyond. Thank you for being a part of our journey!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-12 flex-1 w-full animate-fade-in">
        <h1 className="font-display text-4xl text-charcoal mb-6 font-bold">Privacy Policy</h1>
        <div className="prose text-gray-600 space-y-4 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">Last updated: June 21, 2026</p>
          <p>
            At AURA, we value your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our website and mobile application.
          </p>
          <h2 className="font-semibold text-charcoal text-base mt-4 font-semibold">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including your name, email address, password, phone number, and profile details when you sign up or edit your profile.
          </p>
          <h2 className="font-semibold text-charcoal text-base mt-4 font-semibold">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to operate, maintain, and improve our services, including processing bookings, verifying accounts via OTP, and generating AI insights.
          </p>
          <p>
            We do not sell your personal data to third parties.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-12 flex-1 w-full animate-fade-in">
        <h1 className="font-display text-4xl text-charcoal mb-6 font-bold">Terms of Service</h1>
        <div className="prose text-gray-600 space-y-4 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">Last updated: June 21, 2026</p>
          <p>
            By accessing or using the AURA platform, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
          </p>
          <h2 className="font-semibold text-charcoal text-base mt-4 font-semibold">1. Use of Our Services</h2>
          <p>
            You must be at least 18 years old to create an account or book services. You agree to provide accurate and complete information during registration.
          </p>
          <h2 className="font-semibold text-charcoal text-base mt-4 font-semibold">2. Bookings & Cancellations</h2>
          <p>
            Appointments booked on AURA are subject to creator availability. Any cancellations or rescheduling must be done in accordance with the individual creator's policies.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
