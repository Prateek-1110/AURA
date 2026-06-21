import { useState } from "react";
import Navbar from "../../components/Navbar";

const MOCK_TRANSACTIONS = [
  { id: 1, customer: "Meera R.", service: "Balayage", date: "June 28", amount: 4500, status: "paid", payout: "Jul 5" },
  { id: 2, customer: "Ananya K.", service: "Keratin", date: "June 30", amount: 6000, status: "paid", payout: "Jul 7" },
  { id: 3, customer: "Divya S.", service: "Haircut", date: "July 2", amount: 800, status: "pending", payout: "Jul 9" },
  { id: 4, customer: "Sneha P.", service: "Hair Color", date: "July 4", amount: 2800, status: "pending", payout: "Jul 11" },
  { id: 5, customer: "Priya M.", service: "Highlights", date: "June 20", amount: 3200, status: "paid", payout: "Jun 27" },
  { id: 6, customer: "Kavya T.", service: "Balayage", date: "June 15", amount: 4500, status: "paid", payout: "Jun 22" },
];

const MONTHLY = [
  { month: "Jan", amount: 38400 },
  { month: "Feb", amount: 42000 },
  { month: "Mar", amount: 36800 },
  { month: "Apr", amount: 51200 },
  { month: "May", amount: 47000 },
  { month: "Jun", amount: 52800 },
];

const MAX_VAL = Math.max(...MONTHLY.map(m => m.amount));

export default function EarningsDashboard() {
  const [period, setPeriod] = useState("This month");

  const totalThisMonth = MOCK_TRANSACTIONS.reduce((a, t) => a + t.amount, 0);
  const paid = MOCK_TRANSACTIONS.filter(t => t.status === "paid").reduce((a, t) => a + t.amount, 0);
  const pending = MOCK_TRANSACTIONS.filter(t => t.status === "pending").reduce((a, t) => a + t.amount, 0);
  const platformFee = Math.round(totalThisMonth * 0.05);
  const netEarnings = totalThisMonth - platformFee;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-8 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Earnings</h1>
            <p className="text-gray-400 text-sm mt-1">Track your income and payouts</p>
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy text-gray-600">
            {["This month", "Last month", "Last 3 months", "This year"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total revenue", value: `₹${(totalThisMonth/1000).toFixed(0)}K`, color: "text-charcoal", sub: "This month" },
            { label: "Paid out", value: `₹${(paid/1000).toFixed(0)}K`, color: "text-teal-600", sub: "To your account" },
            { label: "Pending payout", value: `₹${(pending/1000).toFixed(0)}K`, color: "text-amber-600", sub: "Processing" },
            { label: "Net earnings", value: `₹${(netEarnings/1000).toFixed(0)}K`, color: "text-burgundy", sub: "After 5% fee" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className={`font-display text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-charcoal mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-charcoal text-sm mb-5">Monthly revenue</h2>
          <div className="flex items-end gap-3 h-32">
            {MONTHLY.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">₹{(m.amount/1000).toFixed(0)}K</span>
                <div className="w-full rounded-t-lg bar-fill bg-burgundy/20 hover:bg-burgundy transition-all relative"
                  style={{ height: `${(m.amount / MAX_VAL) * 100}%` }}>
                  {m.month === "Jun" && <div className="absolute inset-0 rounded-t-lg bg-burgundy" />}
                </div>
                <span className="text-xs text-gray-500 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="font-semibold text-charcoal text-sm mb-3">Transactions</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span className="col-span-2">Customer / Service</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {MOCK_TRANSACTIONS.map(t => (
              <div key={t.id} className="grid grid-cols-5 gap-4 px-5 py-4 border-t border-gray-50 items-center">
                <div className="col-span-2">
                  <p className="text-sm font-medium text-charcoal">{t.customer}</p>
                  <p className="text-xs text-gray-400">{t.service}</p>
                </div>
                <span className="text-xs text-gray-500">{t.date}</span>
                <span className="text-sm font-semibold text-charcoal">₹{t.amount.toLocaleString()}</span>
                <div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    t.status === "paid" ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                  }`}>{t.status === "paid" ? `Paid ${t.payout}` : `Pending`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout info */}
        <div className="mt-4 bg-cream-dark rounded-2xl p-4 text-xs text-gray-500 leading-relaxed">
          💳 Payouts are processed every 7 days to your registered bank account. Platform fee: 5% per transaction.
          <span className="text-burgundy ml-1 cursor-pointer hover:underline">View payout schedule →</span>
        </div>
      </div>
    </div>
  );
}
