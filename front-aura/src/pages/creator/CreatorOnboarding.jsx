import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../api/AuthContext";

const SERVICE_OPTIONS = ["Balayage", "Hair Color", "Keratin", "Highlights", "Haircut", "Hair Extensions", "Perm", "Brazilian Blowout", "Ombre", "Bleach"];
const TEXTURE_OPTIONS = ["Straight", "Wavy", "Curly", "Coily", "Fine", "Thick"];
const CITIES = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Kolkata"];

export default function CreatorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", city: "Bangalore", neighborhood: "", description: "",
    service_types: [], texture_tags: [],
    instagram: "", phone: "", experience_years: "",
  });

  const STEPS = ["Salon name", "Services", "Your story", "Contact"];

  function toggleArray(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));
  }

  async function handleSubmit() {
    setLoading(true); setError("");
    try {
      await api.post("/upload/salon", {
        name: form.name, city: form.city, neighborhood: form.neighborhood,
        description: form.description, service_types: form.service_types, texture_tags: form.texture_tags,
      });
      navigate("/creator/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Setup failed. Please try again.");
      setLoading(false);
    }
  }

  const canNext = [
    form.name.trim() && form.city,
    form.service_types.length > 0,
    form.description.trim().length > 20,
    true,
  ];

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-display text-2xl text-charcoal mb-1">Set up your studio, {user?.name?.split(" ")[0]}</p>
          <p className="text-gray-400 text-sm">This takes about 2 minutes</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all ${
                i < step ? "bg-burgundy" : i === step ? "w-4 bg-burgundy" : "bg-gray-200"
              }`} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-display text-xl text-charcoal mb-5">{STEPS[step]}</h2>

          {/* Step 0: Salon name + location */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Salon / Studio Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. AURA Studio, Priya's Salon"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">City</label>
                  <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition bg-white">
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Neighbourhood</label>
                  <input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    placeholder="e.g. Indiranagar"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div>
              <p className="text-xs text-gray-400 mb-3">Select all services you offer</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {SERVICE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleArray("service_types", s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                      form.service_types.includes(s) ? "bg-burgundy text-white border-burgundy" : "border-gray-200 text-gray-600 hover:border-burgundy/40"
                    }`}>{s}</button>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-2">Hair textures you specialise in</p>
              <div className="flex flex-wrap gap-2">
                {TEXTURE_OPTIONS.map(t => (
                  <button key={t} type="button" onClick={() => toggleArray("texture_tags", t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                      form.texture_tags.includes(t) ? "bg-charcoal text-white border-charcoal" : "border-gray-200 text-gray-600 hover:border-charcoal/40"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">About your studio</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={5} placeholder="Tell clients what makes your salon special — your philosophy, experience, specialties, the vibe..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy resize-none transition" />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length} / 500</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Years of experience</label>
                <input type="number" min="0" max="40" value={form.experience_years}
                  onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}
                  placeholder="e.g. 5" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone number</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  type="tel" placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Instagram (optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                    placeholder="yoursalonhandle" className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div className="bg-cream-dark rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                ✨ After setup, you can upload your portfolio, set availability, and start accepting bookings from the creator dashboard.
              </div>
            </div>
          )}

          {/* Navigation */}
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
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-burgundy text-white py-3 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-50">
                {loading ? "Setting up..." : "Complete setup →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
