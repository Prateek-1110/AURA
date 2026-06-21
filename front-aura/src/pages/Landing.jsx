import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import Footer from "../components/Footer";

const HERO_SLIDES = [
  { label: "Balayage", gradient: "from-amber-100 to-orange-50" },
  { label: "Keratin Treatment", gradient: "from-rose-100 to-pink-50" },
  { label: "Hair Color", gradient: "from-purple-100 to-violet-50" },
  { label: "Extensions", gradient: "from-teal-100 to-cyan-50" },
];

const CATEGORIES = [
  { icon: "🌊", label: "Balayage", count: "240+ looks" },
  { icon: "✨", label: "Highlights", count: "180+ looks" },
  { icon: "🎨", label: "Hair Color", count: "320+ looks" },
  { icon: "💇", label: "Haircuts", count: "410+ looks" },
  { icon: "🌿", label: "Keratin", count: "95+ looks" },
  { icon: "💫", label: "Extensions", count: "140+ looks" },
  { icon: "🔥", label: "Brazilian Blowout", count: "60+ looks" },
  { icon: "🌀", label: "Perm", count: "45+ looks" },
];

const FEATURED = [
  { id: 1, name: "Luminary Studio", city: "Indiranagar, Bangalore", rating: 4.9, reviews: 128, services: ["Balayage", "Highlights"], looks: 34 },
  { id: 2, name: "The Mane Club", city: "Koramangala, Bangalore", rating: 4.8, reviews: 96, services: ["Hair Color", "Keratin"], looks: 28 },
  { id: 3, name: "Velvet & Veil", city: "HSR Layout, Bangalore", rating: 4.7, reviews: 74, services: ["Haircuts", "Extensions"], looks: 21 },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Discover creators", body: "Browse talented hair stylists across Bangalore filtered by service, neighbourhood, and style." },
  { step: "02", title: "Explore portfolios", body: "Browse high-quality before & after transformations of actual hair work." },
  { step: "03", title: "Book in seconds", body: "Pick a slot, confirm your service, and you're done. Real-time availability, no back-and-forth." },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (user) navigate(user.role === "creator" ? "/creator/dashboard" : "/explore");
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setActiveSlide(s => (s + 1) % HERO_SLIDES.length), 2800);
    return () => clearInterval(t);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <span className="font-display text-xl text-charcoal">AURA</span>
          <div className="flex items-center gap-2">
            <Link to="/explore" className="text-sm text-gray-500 hover:text-charcoal px-3 py-1.5 hidden sm:block">Explore</Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-charcoal px-3 py-1.5">Sign in</Link>
            <Link to="/register" className="text-sm bg-burgundy text-white px-4 py-2 rounded-xl font-medium hover:bg-burgundy-dark transition">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[activeSlide].gradient} transition-all duration-1000`} />
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full px-4 py-1.5 mb-6 text-xs font-medium text-charcoal/70">
              <span className="w-2 h-2 bg-burgundy rounded-full animate-pulse" />
              Now live in Bangalore
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-charcoal leading-tight mb-4">
              Find your look.<br />
              <span className="text-burgundy">Explore looks & book in seconds.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Discover talented hair creators, explore before & after transformations, and book your appointment — all in one place.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-4">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by service or neighbourhood..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition placeholder:text-gray-300 shadow-sm"
              />
              <button type="submit" className="bg-burgundy text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-burgundy-dark transition">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 text-xs">
              {["Balayage", "Keratin", "Hair Color", "Highlights"].map(s => (
                <Link
                  key={s}
                  to={`/explore?service=${encodeURIComponent(s)}`}
                  className="bg-white/70 border border-white/50 text-charcoal px-3 py-1.5 rounded-full hover:bg-white transition"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { n: "1,200+", label: "Transformations" },
            { n: "80+", label: "Creators" },
            { n: "4.8★", label: "Average Rating" },
          ].map(s => (
            <div key={s.label}>
              <p className="font-display text-2xl md:text-3xl text-charcoal">{s.n}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <p className="section-label mb-2">Browse by style</p>
        <h2 className="font-display text-3xl text-charcoal mb-8">What are you looking for?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.label}
              to={`/explore?service=${encodeURIComponent(c.label)}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-burgundy/30 hover:shadow-glass transition group persona-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-2xl block mb-2">{c.icon}</span>
              <p className="font-medium text-sm text-charcoal group-hover:text-burgundy transition">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-charcoal text-white py-16">
        <div className="max-w-6xl mx-auto px-5">
          <p className="section-label text-gray-400 mb-2">Simple as 1 — 2 — 3</p>
          <h2 className="font-display text-3xl mb-10">How AURA works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={h.step} className="persona-card" style={{ animationDelay: `${i * 150}ms` }}>
                <span className="font-display text-4xl text-burgundy/60 mb-3 block">{h.step}</span>
                <h3 className="font-semibold text-white text-lg mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured creators */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-label mb-1">Top rated this month</p>
            <h2 className="font-display text-3xl text-charcoal">Featured creators</h2>
          </div>
          <Link to="/explore" className="text-sm text-burgundy hover:underline hidden sm:block">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED.map((f, i) => (
            <Link
              key={f.id}
              to={`/salon/${f.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-burgundy/30 hover:shadow-glass transition group persona-card"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy/20 to-burgundy/5 flex items-center justify-center text-burgundy font-display text-xl mb-3">
                {f.name[0]}
              </div>
              <h3 className="font-semibold text-charcoal group-hover:text-burgundy transition">{f.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">{f.city}</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-amber-600">★ {f.rating}</span>
                <span className="text-xs text-gray-400">{f.reviews} reviews</span>
                <span className="text-xs text-gray-400">{f.looks} looks</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {f.services.map(s => (
                  <span key={s} className="text-xs bg-burgundy/8 text-burgundy px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-burgundy to-[#8B3547] text-white py-16">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <h2 className="font-display text-4xl mb-3">Are you a hair creator?</h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Showcase your work, attract new clients, and grow your bookings with our premium booking platform.
          </p>
          <Link
            to="/register?role=creator"
            className="inline-block bg-white text-burgundy px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-cream transition"
          >
            Join as a creator →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
