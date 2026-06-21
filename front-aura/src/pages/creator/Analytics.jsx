import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

function FileDropZone({ label, accept, value, onChange, preview }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    const f = files[0];
    if (f) onChange(f);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
        dragging ? "border-burgundy bg-burgundy/5" : "border-gray-200 hover:border-burgundy/40"
      }`}
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => handleFiles(e.target.files)} />
      {preview ? (
        <div className="relative">
          <video src={URL.createObjectURL(preview)} className="max-h-40 mx-auto rounded-xl object-contain" />
          <p className="text-xs text-gray-400 mt-2 truncate">{preview.name}</p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-2xl">
            🎬
          </div>
          <p className="text-sm font-medium text-charcoal">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Drop video file or click to browse</p>
          <p className="text-xs text-gray-300 mt-0.5">MP4, MOV up to 200MB</p>
        </>
      )}
    </div>
  );
}


const MOCK_VIDEOS = [
  { id: 1, title: "Balayage Transformation — Wavy Hair", status: "published", virality_score: 87.4, views: 12400, saves: 340, try_ons: 89, created_at: "Jun 15", trend: "up" },
  { id: 2, title: "Keratin Smoothing — Before & After", status: "published", virality_score: 72.1, views: 8200, saves: 210, try_ons: 54, created_at: "Jun 10", trend: "up" },
  { id: 3, title: "Global Color Refresh — Dark to Light", status: "published", virality_score: 61.8, views: 5100, saves: 130, try_ons: 31, created_at: "Jun 5", trend: "stable" },
  { id: 4, title: "Precision Bob Cut — Fine Hair", status: "processing", virality_score: null, views: 0, saves: 0, try_ons: 0, created_at: "Jun 20", trend: null },
  { id: 5, title: "Ombre Highlights — Thick Hair", status: "published", virality_score: 44.3, views: 2900, saves: 76, try_ons: 18, created_at: "May 30", trend: "down" },
];

function ScoreBadge({ score }) {
  if (score == null) return <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Pending</span>;
  const color = score >= 75 ? "bg-teal-100 text-teal-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-500";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${color}`}>{score.toFixed(1)}</span>;
}

function TrendArrow({ trend }) {
  if (!trend) return null;
  if (trend === "up") return <span className="text-teal-500 text-sm">↑</span>;
  if (trend === "down") return <span className="text-red-400 text-sm">↓</span>;
  return <span className="text-gray-400 text-sm">→</span>;
}

function MiniBar({ value, max, color = "bg-burgundy" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-12 text-right">{value >= 1000 ? `${(value/1000).toFixed(1)}K` : value}</span>
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("virality");
  const [showUpload, setShowUpload] = useState(false);

  // Video upload state
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videoSuccess, setVideoSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleVideoUpload(e) {
    e.preventDefault();
    if (!videoFile || !videoTitle) return;
    setVideoLoading(true); setVideoError(""); setVideoSuccess(false); setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append("video", videoFile);
      fd.append("title", videoTitle);
      if (videoDesc) fd.append("description", videoDesc);

      const { data } = await api.post("/virality/video", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });
      setVideoSuccess(true);
      setVideoFile(null); setVideoTitle(""); setVideoDesc(""); setUploadProgress(0);
      setVideos(prev => [data, ...prev]);
      setTimeout(() => {
        navigate(`/creator/video/${data.id}`);
      }, 1500);
    } catch (err) {
      setVideoError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  }


  useEffect(() => {
    setLoading(true);
    api.get("/virality/videos")
      .then(({ data }) => { if (data.length) setVideos(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...videos].sort((a, b) => {
    if (sort === "virality") return (b.virality_score || 0) - (a.virality_score || 0);
    if (sort === "views") return b.views - a.views;
    if (sort === "try_ons") return b.try_ons - a.try_ons;
    return 0;
  });

  const published = videos.filter(v => v.status === "published");
  const avgScore = published.length
    ? (published.reduce((a, v) => a + (v.virality_score || 0), 0) / published.length).toFixed(1) : "—";
  const totalViews = published.reduce((a, v) => a + v.views, 0);
  const totalTryOns = published.reduce((a, v) => a + v.try_ons, 0);
  const maxViews = Math.max(...videos.map(v => v.views), 1);
  const maxScore = 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-8 w-full flex-1">
        <Link to="/creator/dashboard" className="text-xs text-gray-400 hover:text-charcoal transition mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Video virality scores and engagement</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="self-start sm:self-auto bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition shadow-sm flex items-center gap-1.5"
          >
            {showUpload ? "Hide Upload ✕" : "Upload New Video +"}
          </button>
        </div>

        {/* Collapsible Video Upload Drawer */}
        {showUpload && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 transition-all duration-300">
            <h2 className="font-semibold text-charcoal text-base mb-2">Simulate Video Virality</h2>
            <p className="text-xs text-gray-400 mb-4">Upload a video before posting to simulate performance across 15 synthetic personas.</p>

            <form onSubmit={handleVideoUpload} className="space-y-4">
              {videoSuccess && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <span>✓</span> Video uploaded successfully! Running AI virality check...
                </div>
              )}
              {videoError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{videoError}</div>
              )}

              <FileDropZone label="Upload your salon / hair styling video" accept="video/*" value={videoFile} onChange={setVideoFile} preview={videoFile} />

              {videoLoading && uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading video...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-burgundy h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Video title</label>
                  <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} required
                    placeholder="e.g. Balayage Transformation — Koramangala Studio"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description (optional)</label>
                  <input value={videoDesc} onChange={e => setVideoDesc(e.target.value)}
                    placeholder="Details about the style, products used, etc."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
              </div>

              <button type="submit" disabled={!videoFile || !videoTitle || videoLoading}
                className="w-full bg-burgundy text-white py-3 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-40">
                {videoLoading ? `Uploading ${uploadProgress > 0 ? `(${uploadProgress}%)` : "..."}` : "Analyze Virality"}
              </button>
            </form>
          </div>
        )}


        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Avg virality score", value: avgScore, sub: "Out of 100", color: "text-burgundy" },
            { label: "Total views", value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(0)}K` : totalViews, sub: "Across all videos", color: "text-charcoal" },
            { label: "Total try-ons", value: totalTryOns, sub: "AI virtual try-ons", color: "text-teal-600" },
            { label: "Videos published", value: published.length, sub: `${videos.filter(v => v.status === "processing").length} processing`, color: "text-charcoal" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-charcoal mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Score guide */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-charcoal text-sm mb-3">What's a virality score?</h2>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { range: "75–100", label: "Viral 🔥", desc: "High engagement, likely to spread", color: "bg-teal-50 border-teal-200 text-teal-700" },
              { range: "50–74", label: "Growing 📈", desc: "Good performance, gaining momentum", color: "bg-amber-50 border-amber-200 text-amber-700" },
              { range: "0–49", label: "Needs boost 💡", desc: "Try adding better tags or repost", color: "bg-red-50 border-red-200 text-red-500" },
            ].map(s => (
              <div key={s.range} className={`rounded-xl border p-3 ${s.color}`}>
                <p className="font-bold">{s.range}</p>
                <p className="font-semibold mt-0.5">{s.label}</p>
                <p className="opacity-80 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Videos table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-charcoal text-sm">Video performance</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Sort by:</span>
              {["virality", "views", "try_ons"].map(s => (
                <button key={s} onClick={() => setSort(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${
                    sort === s ? "bg-burgundy text-white" : "border border-gray-200 text-gray-500 hover:border-burgundy/40"
                  }`}>
                  {s === "try_ons" ? "Try-ons" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" /></div>
          ) : (
            sorted.map((v, i) => (
              <div key={v.id} className="px-5 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-4">
                  <span className="text-xs text-gray-300 w-4 flex-shrink-0 mt-1">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{v.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            v.status === "published" ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"
                          }`}>{v.status}</span>
                          <span className="text-xs text-gray-400">{v.created_at}</span>
                          {v.trend && <TrendArrow trend={v.trend} />}
                        </div>
                      </div>
                      <ScoreBadge score={v.virality_score} />
                    </div>

                    {v.status === "published" && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Views</p>
                          <MiniBar value={v.views} max={maxViews} color="bg-charcoal" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Saves</p>
                          <MiniBar value={v.saves} max={500} color="bg-burgundy/60" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Try-ons</p>
                          <MiniBar value={v.try_ons} max={100} color="bg-teal-400" />
                        </div>
                      </div>
                    )}

                    {v.virality_score != null && v.virality_score < 50 && (
                      <p className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                        💡 Tip: Add more descriptive tags and post during peak hours (7–9 PM) to improve score.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
