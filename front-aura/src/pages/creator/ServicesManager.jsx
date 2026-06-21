import { useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

const INIT_SERVICES = [
  { id: 1, name: "Signature Balayage", duration: "3 hrs", price: 4500, description: "Full balayage with toning and treatment", active: true },
  { id: 2, name: "Global Hair Color", duration: "2 hrs", price: 2800, description: "Root-to-tip color with premium dyes", active: true },
  { id: 3, name: "Keratin Treatment", duration: "2.5 hrs", price: 6000, description: "Smoothing treatment lasting 3–4 months", active: true },
  { id: 4, name: "Precision Haircut", duration: "45 min", price: 800, description: "Cut + blow-dry + style", active: true },
];

const DURATION_OPTIONS = ["30 min", "45 min", "1 hr", "1.5 hrs", "2 hrs", "2.5 hrs", "3 hrs", "3.5 hrs", "4 hrs"];

function ServiceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: "", duration: "1 hr", price: "", description: "" });
  return (
    <div className="bg-cream rounded-2xl border border-burgundy/20 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Service name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Signature Balayage"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-burgundy transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Duration</label>
          <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-burgundy transition bg-white">
            {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Price (₹)</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="e.g. 4500" min="0"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-burgundy transition" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} placeholder="Brief description of what's included"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-burgundy resize-none transition" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} disabled={!form.name || !form.price}
          className="flex-1 bg-burgundy text-white py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-dark transition disabled:opacity-40">
          Save service
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ServicesManager() {
  const [services, setServices] = useState(INIT_SERVICES);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  function handleAdd(form) {
    const newSvc = { ...form, id: Date.now(), active: true, price: Number(form.price) };
    setServices(prev => [...prev, newSvc]);
    setAdding(false);
    api.post("/services", newSvc).catch(() => {});
  }

  function handleEdit(form) {
    setServices(prev => prev.map(s => s.id === editing ? { ...s, ...form, price: Number(form.price) } : s));
    setEditing(null);
    api.patch(`/services/${editing}`, form).catch(() => {});
  }

  function handleToggle(id) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  function handleDelete(id) {
    if (!confirm("Delete this service?")) return;
    setServices(prev => prev.filter(s => s.id !== id));
    api.delete(`/services/${id}`).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-8 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Services & Pricing</h1>
            <p className="text-gray-400 text-sm mt-1">{services.filter(s => s.active).length} active services</p>
          </div>
          {!adding && (
            <button onClick={() => setAdding(true)}
              className="bg-burgundy text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-dark transition">
              + Add service
            </button>
          )}
        </div>

        {adding && (
          <div className="mb-4">
            <ServiceForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </div>
        )}

        <div className="space-y-3">
          {services.map(svc => (
            <div key={svc.id}>
              {editing === svc.id ? (
                <ServiceForm initial={svc} onSave={handleEdit} onCancel={() => setEditing(null)} />
              ) : (
                <div className={`bg-white rounded-2xl border shadow-sm p-5 transition ${svc.active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-charcoal">{svc.name}</h3>
                        {!svc.active && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{svc.duration}</p>
                      {svc.description && <p className="text-xs text-gray-500 leading-relaxed">{svc.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-xl text-charcoal">₹{svc.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => setEditing(svc.id)} className="text-xs text-gray-500 hover:text-charcoal transition px-3 py-1.5 rounded-lg hover:bg-gray-50">
                      Edit
                    </button>
                    <button onClick={() => handleToggle(svc.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                        svc.active ? "text-amber-600 hover:bg-amber-50" : "text-teal-600 hover:bg-teal-50"
                      }`}>
                      {svc.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(svc.id)} className="text-xs text-red-400 hover:text-red-600 transition px-3 py-1.5 rounded-lg hover:bg-red-50 ml-auto">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
