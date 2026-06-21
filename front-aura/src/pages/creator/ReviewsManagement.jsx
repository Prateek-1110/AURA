import { useState } from "react";
import Navbar from "../../components/Navbar";

const MOCK_REVIEWS = [
  { id: 1, author: "Meera R.", avatar: "M", rating: 5, service: "Balayage", text: "Absolutely loved the balayage! The color blending was perfect and exactly what I had in mind. Priya is so talented and professional.", date: "June 28, 2025", replied: false },
  { id: 2, author: "Ananya K.", avatar: "A", rating: 5, service: "Keratin Treatment", text: "Best keratin treatment I've ever had. Hair is so smooth and the results lasted months! Highly recommend to everyone.", date: "June 20, 2025", replied: true, reply: "Thank you Ananya! It was a pleasure having you. See you next time! 😊" },
  { id: 3, author: "Divya S.", avatar: "D", rating: 4, service: "Haircut", text: "Great experience overall. Very professional and the salon has a lovely ambience. Will be back for colour.", date: "June 15, 2025", replied: false },
  { id: 4, author: "Priya M.", avatar: "P", rating: 5, service: "Highlights", text: "Stunning highlights! I've been getting compliments all week. This is my new go-to salon.", date: "June 1, 2025", replied: true, reply: "So happy to hear that Priya! Can't wait to see you again ✨" },
  { id: 5, author: "Kavya T.", avatar: "K", rating: 3, service: "Hair Color", text: "Good work but I felt the process took longer than expected. The colour did turn out nice though.", date: "May 25, 2025", replied: false },
];

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? "text-amber-400" : "text-gray-200"}>★</span>
      ))}
    </span>
  );
}

const avg = (MOCK_REVIEWS.reduce((a, r) => a + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);

const dist = [5,4,3,2,1].map(n => ({
  star: n,
  count: MOCK_REVIEWS.filter(r => r.rating === n).length,
  pct: Math.round((MOCK_REVIEWS.filter(r => r.rating === n).length / MOCK_REVIEWS.length) * 100),
}));

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("All");

  function submitReply(id) {
    if (!replyText.trim()) return;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, replied: true, reply: replyText.trim() } : r));
    setReplyingTo(null);
    setReplyText("");
  }

  const filtered = reviews.filter(r =>
    filter === "All" ? true :
    filter === "5 Stars" ? r.rating === 5 :
    filter === "Needs reply" ? !r.replied : true
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-charcoal">Reviews</h1>
          <p className="text-gray-400 text-sm mt-1">{reviews.length} reviews · {avg} average rating</p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-start gap-8">
            <div className="text-center flex-shrink-0">
              <p className="font-display text-5xl text-charcoal">{avg}</p>
              <Stars rating={Math.round(Number(avg))} />
              <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {dist.map(d => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-8">{d.star} ★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["All", "5 Stars", "Needs reply"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                filter === f ? "bg-burgundy text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-burgundy/40"
              }`}>
              {f}
              {f === "Needs reply" && reviews.filter(r => !r.replied).length > 0 && (
                <span className="ml-1.5 bg-burgundy text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-xs font-bold">
                  {reviews.filter(r => !r.replied).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${!r.replied ? "border-amber-100" : "border-gray-100"}`}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-burgundy flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{r.author}</p>
                      <p className="text-xs text-gray-400">{r.service} · {r.date}</p>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.text}</p>

              {r.replied && r.reply && (
                <div className="bg-cream rounded-xl px-4 py-3 text-sm text-gray-600 leading-relaxed border-l-2 border-burgundy/30 ml-2">
                  <p className="text-xs font-semibold text-burgundy mb-1">Your reply</p>
                  {r.reply}
                </div>
              )}

              {!r.replied && (
                replyingTo === r.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      rows={3} placeholder="Write a thoughtful reply..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy resize-none transition" />
                    <div className="flex gap-2">
                      <button onClick={() => submitReply(r.id)} disabled={!replyText.trim()}
                        className="text-xs bg-burgundy text-white px-4 py-2 rounded-xl hover:bg-burgundy-dark transition disabled:opacity-40 font-medium">
                        Post reply
                      </button>
                      <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="text-xs border border-gray-200 text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setReplyingTo(r.id); setReplyText(""); }}
                    className="text-xs text-burgundy hover:underline font-medium flex items-center gap-1 mt-1">
                    ↩ Reply to review
                  </button>
                )
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No reviews matching this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
