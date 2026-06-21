import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../api/AuthContext";
import Navbar from "../../components/Navbar";

const SERVICE_OPTIONS = ["Balayage", "Hair Color", "Keratin", "Highlights", "Haircut", "Hair Extensions", "Perm", "Ombre", "Brazilian Blowout"];
const TEXTURE_OPTIONS = ["Straight", "Wavy", "Curly", "Coily", "Fine", "Thick"];
const TABS = ["Transformation (Before/After)", "Video"];

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
          {preview.type?.startsWith("video") ? (
            <video src={URL.createObjectURL(preview)} className="max-h-40 mx-auto rounded-xl object-contain" />
          ) : (
            <img src={URL.createObjectURL(preview)} alt="" className="max-h-40 mx-auto rounded-xl object-contain" />
          )}
          <p className="text-xs text-gray-400 mt-2 truncate">{preview.name}</p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-2xl">
            {accept.includes("video") ? "🎬" : "📷"}
          </div>
          <p className="text-sm font-medium text-charcoal">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Drop file or click to browse</p>
          <p className="text-xs text-gray-300 mt-0.5">{accept.includes("video") ? "MP4, MOV up to 200MB" : "JPG, PNG up to 10MB"}</p>
        </>
      )}
    </div>
  );
}

export default function ContentUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // Transformation state
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [serviceType, setServiceType] = useState("");
  const [artistName, setArtistName] = useState(user?.name || "");
  const [hairTexture, setHairTexture] = useState("");
  const [transformLoading, setTransformLoading] = useState(false);
  const [transformError, setTransformError] = useState("");
  const [transformSuccess, setTransformSuccess] = useState(false);

  // Video state
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videoSuccess, setVideoSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleTransformationUpload(e) {
    e.preventDefault();
    if (!beforeFile || !afterFile || !serviceType) return;
    setTransformLoading(true); setTransformError(""); setTransformSuccess(false);
    try {
      const fd = new FormData();
      fd.append("before_image", beforeFile);
      fd.append("after_image", afterFile);
      fd.append("service_type", serviceType);
      fd.append("artist_name", artistName);
      if (hairTexture) fd.append("hair_texture_tag", hairTexture);

      await api.post("/upload/transformation", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTransformSuccess(true);
      setBeforeFile(null); setAfterFile(null); setServiceType(""); setHairTexture("");
    } catch (err) {
      setTransformError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setTransformLoading(false);
    }
  }

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
      setTimeout(() => {
        navigate(`/creator/video/${data.id}`);
      }, 1500);
    } catch (err) {
      setVideoError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto px-5 py-8 w-full flex-1">
        <Link to="/creator/dashboard" className="text-xs text-gray-400 hover:text-charcoal transition mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="mb-6">
          <h1 className="font-display text-3xl text-charcoal">Upload Content</h1>
          <p className="text-gray-400 text-sm mt-1">Add to your portfolio or publish a video</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${
                tab === i ? "bg-burgundy text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-burgundy/40"
              }`}>{t}</button>
          ))}
        </div>

        {/* Before/After upload */}
        {tab === 0 && (
          <form onSubmit={handleTransformationUpload} className="space-y-5">
            {transformSuccess && (
              <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <span>✓</span> Transformation uploaded! It's now live on your portfolio.
              </div>
            )}
            {transformError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{transformError}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Before</p>
                <FileDropZone label="Before photo" accept="image/*" value={beforeFile} onChange={setBeforeFile} preview={beforeFile} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">After</p>
                <FileDropZone label="After photo" accept="image/*" value={afterFile} onChange={setAfterFile} preview={afterFile} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Service type</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setServiceType(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                        serviceType === s ? "bg-burgundy text-white border-burgundy" : "border-gray-200 text-gray-600 hover:border-burgundy/40"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Artist name</label>
                  <input value={artistName} onChange={e => setArtistName(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Hair texture</label>
                  <select value={hairTexture} onChange={e => setHairTexture(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition bg-white">
                    <option value="">Select texture</option>
                    {TEXTURE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={!beforeFile || !afterFile || !serviceType || transformLoading}
              className="w-full bg-burgundy text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-40">
              {transformLoading ? "Uploading..." : "Upload transformation"}
            </button>
          </form>
        )}

        {/* Video upload */}
        {tab === 1 && (
          <form onSubmit={handleVideoUpload} className="space-y-5">
            {videoSuccess && (
              <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <span>✓</span> Video uploaded! We'll process it and calculate your virality score shortly.
              </div>
            )}
            {videoError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{videoError}</div>
            )}

            <FileDropZone label="Upload your video" accept="video/*" value={videoFile} onChange={setVideoFile} preview={videoFile} />

            {videoLoading && uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-burgundy h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Video title</label>
                <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} required
                  placeholder="e.g. Balayage transformation — before & after"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description (optional)</label>
                <textarea value={videoDesc} onChange={e => setVideoDesc(e.target.value)}
                  rows={3} placeholder="Details about the transformation, products used, etc."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burgundy resize-none transition" />
              </div>
            </div>

            <div className="bg-cream-dark rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
              🤖 After upload, our AI will analyse your video and generate a virality score based on engagement signals. Results appear in your Analytics dashboard within 15 minutes.
            </div>

            <button type="submit" disabled={!videoFile || !videoTitle || videoLoading}
              className="w-full bg-burgundy text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition disabled:opacity-40">
              {videoLoading ? `Uploading ${uploadProgress > 0 ? `(${uploadProgress}%)` : "..."}` : "Upload video"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
