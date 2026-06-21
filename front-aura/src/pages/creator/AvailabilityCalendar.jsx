import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

const INIT_AVAILABILITY = {
  Mon: { enabled: true, from: "10:00 AM", to: "6:00 PM" },
  Tue: { enabled: true, from: "10:00 AM", to: "6:00 PM" },
  Wed: { enabled: true, from: "10:00 AM", to: "6:00 PM" },
  Thu: { enabled: true, from: "10:00 AM", to: "6:00 PM" },
  Fri: { enabled: true, from: "10:00 AM", to: "6:00 PM" },
  Sat: { enabled: true, from: "10:00 AM", to: "5:00 PM" },
  Sun: { enabled: false, from: "10:00 AM", to: "3:00 PM" },
};

const BLOCKED_DATES = [
  new Date(2025, 5, 30),
  new Date(2025, 6, 4),
  new Date(2025, 6, 5),
];

function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

export default function AvailabilityCalendar() {
  const [availability, setAvailability] = useState(INIT_AVAILABILITY);
  const [blockedDates, setBlockedDates] = useState(BLOCKED_DATES);
  const [currentMonth, setCurrentMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const days = getDaysInMonth(currentMonth.year, currentMonth.month);
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en", { month: "long", year: "numeric" });

  function toggleDay(day) {
    setAvailability(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
  }

  function toggleBlockedDate(date) {
    const isBlocked = blockedDates.some(d => d.toDateString() === date.toDateString());
    setBlockedDates(prev =>
      isBlocked ? prev.filter(d => d.toDateString() !== date.toDateString()) : [...prev, date]
    );
  }

  async function saveAvailability() {
    setSaving(true);
    try {
      await api.post("/availability", { schedule: availability, blocked_dates: blockedDates.map(d => d.toISOString()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  }

  const prevMonth = () => setCurrentMonth(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
  );
  const nextMonth = () => setCurrentMonth(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-8 w-full flex-1">
        <Link to="/creator/dashboard" className="text-xs text-gray-400 hover:text-charcoal transition mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Availability</h1>
            <p className="text-gray-400 text-sm mt-1">Set your working hours and block off days</p>
          </div>
          <button onClick={saveAvailability} disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              saved ? "bg-teal-500 text-white" : "bg-burgundy text-white hover:bg-burgundy-dark"
            } disabled:opacity-50`}>
            {saved ? "✓ Saved" : saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-charcoal text-sm mb-4">Weekly schedule</h2>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className={`flex items-center gap-3 transition ${!availability[day]?.enabled ? "opacity-50" : ""}`}>
                  <button onClick={() => toggleDay(day)}
                    className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                      availability[day]?.enabled ? "bg-burgundy" : "bg-gray-200"
                    }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${
                      availability[day]?.enabled ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                  <span className="text-sm font-medium text-charcoal w-8 flex-shrink-0">{day}</span>
                  {availability[day]?.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={availability[day].from}
                        onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], from: e.target.value } }))}
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-burgundy bg-white">
                        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span className="text-xs text-gray-400">to</span>
                      <select
                        value={availability[day].to}
                        onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], to: e.target.value } }))}
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-burgundy bg-white">
                        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar: block dates */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-charcoal text-sm">Block specific dates</h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">‹</button>
                <span className="text-xs font-medium text-charcoal">{monthName}</span>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">›</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => {
                if (!d) return <div key={i} />;
                const isBlocked = blockedDates.some(bd => bd.toDateString() === d.toDateString());
                const isPast = d < new Date(new Date().setHours(0,0,0,0));
                return (
                  <button key={i} onClick={() => !isPast && toggleBlockedDate(d)} disabled={isPast}
                    className={`text-xs h-8 rounded-lg transition font-medium ${
                      isBlocked ? "bg-red-100 text-red-600 hover:bg-red-200" :
                      isPast ? "text-gray-200 cursor-not-allowed" :
                      "hover:bg-burgundy/10 hover:text-burgundy text-charcoal"
                    }`}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-100 rounded-sm" />Blocked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 rounded-sm" />Past</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
