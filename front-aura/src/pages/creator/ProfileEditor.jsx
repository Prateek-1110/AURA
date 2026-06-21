import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../api/AuthContext";
import Navbar from "../../components/Navbar";

const SERVICE_OPTIONS = ["Balayage", "Hair Color", "Keratin", "Highlights", "Haircut", "Hair Extensions", "Perm", "Brazilian Blowout", "Ombre", "Bleach"];
const TEXTURE_OPTIONS = ["Straight", "Wavy", "Curly", "Coily", "Fine", "Thick"];

export default function ProfileEditor() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "", city: "", neighborhood: "", description: "",
    service_types: [], texture_tags: [], phone: "", instagram: "",
    experience_years: "", open_for_bookings: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/upload/salon/me")
      .then(({ data }) => setForm(f => ({ ...f, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleArray(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    setError(""); setSaved(false);

    const phoneDigits = (form.phone || "").replace(/\D/g, "");
    if (form.phone && form.phone.trim() && phoneDigits.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        phone: phoneDigits || null,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null
      };
      await api.patch("/upload/salon/me", payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-8 w-full flex-1">
        <Link to="/creator/dashboard" className="text-xs text-gray-400 hover:text-charcoal transition mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Edit Profile</h1>
            <p className="text-gray-400 text-sm mt-1">How clients see your studio</p>
          </div>
          <button
            onClick={handleSave} disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              saved ? "bg-teal-500 text-white" : "bg-burgundy text-white hover:bg-burgundy-dark"
            } disabled:opacity-50`}>
            {saved ? "✓ Saved" : saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Studio identity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-charcoal text-sm mb-4">Studio identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Studio name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Neighbourhood</label>
                  <input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    placeholder="e.g. Indiranagar"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">About your studio</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4} placeholder="Describe your specialties, philosophy, and what makes your salon unique..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy resize-none transition" />
                <p className="text-xs text-gray-400 mt-1 text-right">{(form.description || "").length} / 500</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Years of experience</label>
                <input type="number" min="0" max="40" value={form.experience_years}
                  onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}
                  className="w-40 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-charcoal text-sm mb-4">Services offered</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {SERVICE_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleArray("service_types", s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    (form.service_types || []).includes(s) ? "bg-burgundy text-white border-burgundy" : "border-gray-200 text-gray-600 hover:border-burgundy/40"
                  }`}>{s}</button>
              ))}
            </div>

            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Hair textures</h3>
            <div className="flex flex-wrap gap-2">
              {TEXTURE_OPTIONS.map(t => (
                <button key={t} type="button" onClick={() => toggleArray("texture_tags", t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    (form.texture_tags || []).includes(t) ? "bg-charcoal text-white border-charcoal" : "border-gray-200 text-gray-600 hover:border-charcoal/40"
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-charcoal text-sm mb-4">Contact & social</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                <input type="tel" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input value={form.instagram || ""} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                    placeholder="yoursalonhandle"
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Booking settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-charcoal text-sm mb-4">Booking settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Open for bookings</p>
                <p className="text-xs text-gray-400 mt-0.5">Customers can request appointments through AURA</p>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, open_for_bookings: !f.open_for_bookings }))}
                className={`w-12 h-6 rounded-full transition-colors ${form.open_for_bookings ? "bg-burgundy" : "bg-gray-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${form.open_for_bookings ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="pb-6">
            <button type="submit" disabled={saving}
              className="w-full bg-burgundy text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-50">
              {saved ? "✓ Profile saved!" : saving ? "Saving..." : "Save all changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
