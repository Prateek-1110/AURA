import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

const MOCK_TRANSFORMATIONS = [
  { id: 1, service_type: "Balayage", artist_name: "Priya", hair_texture_tag: "Wavy", try_on_count: 23,
    before_image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    after_image_url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80" },
  { id: 2, service_type: "Hair Color", artist_name: "Riya", hair_texture_tag: "Straight", try_on_count: 11,
    before_image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    after_image_url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80" },
  { id: 3, service_type: "Keratin", artist_name: "Priya", hair_texture_tag: "Curly", try_on_count: 8,
    before_image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    after_image_url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&q=80" },
];

function TransformationCard({ t, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 group" style={{ aspectRatio: "3/4" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <img src={t.before_image_url} alt="before" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: hovered ? 0 : 1 }} />
      <img src={t.after_image_url} alt="after" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: hovered ? 1 : 0 }} />
      <div className="absolute top-3 left-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300 ${
          hovered ? "bg-burgundy text-white" : "bg-black/30 text-white"}`}>
          {hovered ? "After" : "Before"}
        </span>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onDelete(t.id)} className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition">
          ✕
        </button>
      </div>
      <div className={`absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}>
        <p className="text-white text-xs font-medium">{t.service_type}</p>
        <p className="text-white/60 text-xs">{t.try_on_count} try-ons</p>
      </div>
    </div>
  );
}

export default function PortfolioManager() {
  const [transformations, setTransformations] = useState(MOCK_TRANSFORMATIONS);

  function handleDelete(id) {
    if (!confirm("Remove this transformation?")) return;
    setTransformations(prev => prev.filter(t => t.id !== id));
    api.delete(`/upload/transformation/${id}`).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-8 w-full flex-1">
        <Link to="/creator/dashboard" className="text-xs text-gray-400 hover:text-charcoal transition mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Portfolio</h1>
            <p className="text-gray-400 text-sm mt-1">{transformations.length} transformations</p>
          </div>
          <Link to="/creator/upload"
            className="bg-burgundy text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-dark transition flex items-center gap-2">
            <span>+</span> Add look
          </Link>
        </div>

        {transformations.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">📷</p>
            <p className="text-sm text-gray-400 mb-4">No transformations yet. Add your first before/after look.</p>
            <Link to="/creator/upload" className="text-sm text-burgundy hover:underline">Upload now →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {transformations.map(t => (
              <TransformationCard key={t.id} t={t} onDelete={handleDelete} />
            ))}
            <Link to="/creator/upload"
              className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-burgundy/40 transition flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-burgundy"
              style={{ aspectRatio: "3/4" }}>
              <span className="text-3xl">+</span>
              <span className="text-xs font-medium">Add look</span>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            { label: "Total try-ons", value: transformations.reduce((a, t) => a + t.try_on_count, 0) },
            { label: "Avg try-ons/look", value: transformations.length ? Math.round(transformations.reduce((a, t) => a + t.try_on_count, 0) / transformations.length) : 0 },
            { label: "Most popular", value: transformations.sort((a, b) => b.try_on_count - a.try_on_count)[0]?.service_type || "—" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="font-display text-2xl text-charcoal">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
