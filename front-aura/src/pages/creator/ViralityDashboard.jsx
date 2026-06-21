import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ── Constants ─────────────────────────────────────────────────────────────────

const PERSONA_META = {
  Priya:  { emoji: "👩‍💼", bg: "bg-rose-50",   ring: "ring-rose-200",   text: "text-rose-700",   bar: "bg-rose-400",   label: "24 · Working Pro · Koramangala" },
  Ananya: { emoji: "👩‍🍼", bg: "bg-amber-50",  ring: "ring-amber-200",  text: "text-amber-700",  bar: "bg-amber-400",  label: "31 · New Mom · Whitefield" },
  Riya:   { emoji: "🎓",  bg: "bg-violet-50", ring: "ring-violet-200", text: "text-violet-700", bar: "bg-violet-400", label: "19 · College Student · Indiranagar" },
  Meera:  { emoji: "💄",  bg: "bg-teal-50",   ring: "ring-teal-200",   text: "text-teal-700",   bar: "bg-teal-400",   label: "28 · Beauty Creator · HSR Layout" },
  Divya:  { emoji: "🏠",  bg: "bg-slate-50",  ring: "ring-slate-200",  text: "text-slate-600",  bar: "bg-slate-400",  label: "42 · Homemaker · Jayanagar" },
  Kiran:  { emoji: "💇‍♂️", bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-700", bar: "bg-emerald-400", label: "27 · Stylist · Malleshwaram" },
  Rohan:  { emoji: "💪",  bg: "bg-blue-50",    ring: "ring-blue-200",    text: "text-blue-700",    bar: "bg-blue-400",    label: "22 · Trainer · HSR Layout" },
  Farah:  { emoji: "👗",  bg: "bg-fuchsia-50", ring: "ring-fuchsia-200", text: "text-fuchsia-700", bar: "bg-fuchsia-400", label: "35 · Designer · Bandra" },
  Vikram: { emoji: "⚖️",  bg: "bg-indigo-50",  ring: "ring-indigo-200",  text: "text-indigo-700",  bar: "bg-indigo-400",  label: "29 · Lawyer · Indiranagar" },
  Neha:   { emoji: "🎒",  bg: "bg-pink-50",    ring: "ring-pink-200",    text: "text-pink-700",    bar: "bg-pink-400",    label: "25 · Student · Jayanagar" },
  Arjun:  { emoji: "💻",  bg: "bg-sky-50",     ring: "ring-sky-200",     text: "text-sky-700",     bar: "bg-sky-400",     label: "33 · Tech Lead · Whitefield" },
  Zoya:   { emoji: "🎨",  bg: "bg-purple-50",  ring: "ring-purple-200",  text: "text-purple-700",  bar: "bg-purple-400",  label: "21 · Art Student · Powai" },
  Mansi:  { emoji: "🌿",  bg: "bg-green-50",   ring: "ring-green-200",   text: "text-green-700",   bar: "bg-green-400",   label: "28 · Marketer · Koramangala" },
  Sanjay: { emoji: "💼",  bg: "bg-orange-50",  ring: "ring-orange-200",  text: "text-orange-700",  bar: "bg-orange-400",  label: "45 · Banker · Malleshwaram" },
  Sneha:  { emoji: "✍️",  bg: "bg-cyan-50",    ring: "ring-cyan-200",    text: "text-cyan-700",    bar: "bg-cyan-400",    label: "26 · Writer · Versova" },
};

const BREAKDOWN_LABELS = {
  hook_rate:       { label: "Hook Rate",       hint: "Watched past 5s",        color: "bg-burgundy" },
  completion:      { label: "Completion",      hint: "Avg watch-through",      color: "bg-amber-500" },
  social_velocity: { label: "Social Velocity", hint: "Share rate",             color: "bg-violet-500" },
  sentiment:       { label: "Sentiment",       hint: "Like rate",              color: "bg-teal-500" },
};

function scoreDiagnostic(score) {
  if (score < 50) return {
    label: "Needs Rework",
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
    text: "Most personas dropped off early — check the first 5 seconds.",
  };
  if (score < 75) return {
    label: "Solid, Limited Reach",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    text: "Try adding price and location in the first 3 seconds.",
  };
  return {
    label: "Viral Potential",
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-100",
    text: "Strong content. Publish and consider a paid boost.",
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1500, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === null || !trigger) return;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);   // cubic ease-out
      setVal(Math.round(target * ease * 10) / 10);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target, duration, trigger]);
  return val;
}

function useStreamedComments(personas, trigger) {
  const [visible, setVisible] = useState({});
  useEffect(() => {
    if (!trigger || !personas.length) return;
    setVisible({});
    personas.forEach((p, i) => {
      if (p.comment) {
        setTimeout(() => {
          setVisible(prev => ({ ...prev, [p.name]: true }));
        }, 800 + i * 300);
      }
    });
  }, [trigger, personas]);
  return visible;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 52, stroke = 7;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  const color = score >= 75 ? "#0d9488" : score >= 50 ? "#f59e0b" : "#dc2626";

  return (
    <svg width={130} height={130} className="rotate-[-90deg]">
      <circle cx={65} cy={65} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle
        cx={65} cy={65} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

function BreakdownBars({ breakdown, animate }) {
  return (
    <div className="space-y-3">
      {Object.entries(BREAKDOWN_LABELS).map(([key, meta]) => {
        const val = breakdown[key] ?? 0;
        return (
          <div key={key}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-medium text-charcoal">{meta.label}</span>
              <span className="text-xs text-gray-400">{meta.hint} · <span className="font-semibold text-charcoal">{val.toFixed(0)}%</span></span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${meta.color} transition-all duration-1000`}
                style={{ width: animate ? `${val}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PersonaCard({ persona, showComment, index }) {
  const meta = PERSONA_META[persona.name] || PERSONA_META.Priya;
  return (
    <div
      className={`${meta.bg} rounded-2xl p-4 ring-1 ${meta.ring} transition-all duration-500`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5 flex-shrink-0">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${meta.text}`}>{persona.name}</span>
            <span className="text-xs text-gray-400">{meta.label}</span>
          </div>

          {/* Watch bar */}
          <div className="mt-2 mb-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Watch-through</span>
              <span className="font-medium text-charcoal">{persona.watch_through}%</span>
            </div>
            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${meta.bar} transition-all duration-1000`}
                style={{ width: `${persona.watch_through}%`, transitionDelay: `${index * 150 + 400}ms` }}
              />
            </div>
          </div>

          {/* Engagement icons */}
          <div className="flex gap-3 mt-2">
            <span className={`text-xs flex items-center gap-1 ${persona.liked ? "text-rose-500" : "text-gray-300"}`}>
              {persona.liked ? "♥" : "♡"} Liked
            </span>
            <span className={`text-xs flex items-center gap-1 ${persona.shared ? "text-violet-500" : "text-gray-300"}`}>
              {persona.shared ? "↗" : "↗"} {persona.shared ? "Shared" : "Didn't share"}
            </span>
            {persona.skipped_at != null && (
              <span className="text-xs text-orange-500">⏭ Stopped at {persona.skipped_at}s</span>
            )}
          </div>

          {/* Comment — streamed in */}
          {persona.comment && (
            <div className={`mt-2 transition-all duration-500 ${showComment ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
              <p className="text-xs italic text-gray-600 bg-white/70 rounded-lg px-3 py-2 leading-relaxed">
                "{persona.comment}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DropoffTimeline({ personas, durationSec }) {
  const duration = durationSec || 30;
  const totalWatchers = personas.length;

  const dropoffs = personas
    .filter(p => p.skipped_at != null)
    .sort((a, b) => a.skipped_at - b.skipped_at);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-charcoal">Drop-off Timeline</span>
        <span className="text-xs text-gray-400">{duration}s video</span>
      </div>

      <div className="relative h-8 bg-gray-100 rounded-full overflow-visible mb-6">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400 to-teal-200 rounded-full opacity-30"
          style={{ width: "100%" }}
        />

        {Array.from({ length: Math.floor(duration / 5) + 1 }, (_, i) => i * 5).map(t => (
          <div
            key={t}
            className="absolute top-0 bottom-0 w-px bg-gray-200"
            style={{ left: `${(t / duration) * 100}%` }}
          />
        ))}

        {dropoffs.map((p, i) => {
          const meta = PERSONA_META[p.name] || PERSONA_META.Priya;
          const leftPct = Math.min((p.skipped_at / duration) * 100, 98);
          return (
            <div
              key={p.name}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-default"
              style={{ left: `${leftPct}%`, zIndex: 10 + i }}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ring-2 ring-white shadow ${meta.bg}`}>
                {meta.emoji}
              </div>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                {p.name} left at {p.skipped_at}s
              </div>
            </div>
          );
        })}

        {personas.filter(p => p.skipped_at == null).map((p, i) => {
          const meta = PERSONA_META[p.name] || PERSONA_META.Priya;
          return (
            <div
              key={p.name}
              className="absolute top-1/2 -translate-y-1/2 group cursor-default"
              style={{ right: `${2 + i * 8}%`, zIndex: 20 + i }}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ring-2 ring-white shadow ${meta.bg}`}>
                {meta.emoji}
              </div>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                {p.name} watched fully ✓
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-300 -mt-4 px-0">
        <span>0s</span>
        {duration >= 10 && <span>{Math.round(duration / 2)}s</span>}
        <span>{duration}s</span>
      </div>
    </div>
  );
}

function SimulatingView() {
  const personas = [
    "Priya", "Ananya", "Riya", "Meera", "Divya",
    "Kiran", "Rohan", "Farah", "Vikram", "Neha",
    "Arjun", "Zoya", "Mansi", "Sanjay", "Sneha"
  ];
  return (
    <div className="py-8 space-y-4">
      <div className="text-center space-y-2 mb-6">
        <div className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-charcoal">Simulating your audience…</p>
        <p className="text-xs text-gray-400">15 personas are watching your video right now</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {personas.map((name, i) => {
          const meta = PERSONA_META[name];
          return (
            <div
              key={name}
              className={`${meta.bg} rounded-2xl p-4 ring-1 ${meta.ring} animate-pulse`}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{meta.emoji}</div>
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${meta.text} mb-1`}>{name}</div>
                  <div className="text-xs text-gray-400">{meta.label}</div>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full ${meta.bar} w-1/2 rounded-full animate-pulse`} />
                  </div>
                </div>
                <div className="text-gray-300 text-lg animate-bounce" style={{ animationDelay: `${i * 300}ms` }}>
                  👀
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RetentionCurveChart({ personas, durationSec }) {
  const duration = durationSec || 30;
  const pointsCount = 10;
  const dataPoints = [];
  
  for (let i = 0; i <= pointsCount; i++) {
    const time = (duration / pointsCount) * i;
    const remaining = personas.filter(p => p.skipped_at === null || p.skipped_at > time).length;
    const retentionPct = (remaining / personas.length) * 100;
    dataPoints.push({ time: Math.round(time * 10) / 10, pct: Math.round(retentionPct) });
  }
  
  const width = 500;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;
  
  const points = dataPoints.map((d, i) => {
    const x = paddingX + (i / pointsCount) * (width - 2 * paddingX);
    const y = height - paddingY - (d.pct / 100) * (height - 2 * paddingY);
    return { x, y, ...d };
  });
  
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, "");
  
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  return (
    <div className="bg-cream-light/30 rounded-2xl p-5 border border-gray-100/80 shadow-inner">
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider">Audience Retention Curve</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">Interactive second-by-second viewer retention</p>
        </div>
        <div className="h-6">
          {hoveredPoint ? (
            <span className="text-xs font-semibold text-burgundy bg-burgundy/5 px-2.5 py-1 rounded-md border border-burgundy/10 transition-all duration-200">
              {hoveredPoint.time}s mark: {hoveredPoint.pct}% watching
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              Hover graph points to details
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#800020" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#800020" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Horizontal Grid lines */}
          {[25, 50, 75, 100].map(val => {
            const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
            return (
              <g key={val}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-gray-400 font-medium font-sans">{val}%</text>
              </g>
            );
          })}
          
          {/* Time label ticks */}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={height - 5} textAnchor="middle" className="text-[10px] fill-gray-400 font-medium font-sans">
              {p.time}s
            </text>
          ))}
          
          {/* Area under the path */}
          <path d={areaD} fill="url(#chartGrad)" className="transition-all duration-500" />
          
          {/* Main line */}
          <path d={pathD} fill="none" stroke="#800020" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Markers */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.time === p.time ? 6 : 4}
              className="fill-white stroke-burgundy cursor-pointer transition-all duration-150 hover:scale-125"
              strokeWidth={2}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function ActionableAdvice({ breakdown, score }) {
  const hookRate = breakdown.hook_rate ?? 0;
  const completion = breakdown.completion ?? 0;
  const social = breakdown.social_velocity ?? 0;
  const sentiment = breakdown.sentiment ?? 0;

  const recommendations = [];

  // Hook Rate Rule
  if (hookRate < 50) {
    recommendations.push({
      status: "critical",
      title: "Hook is Weak (Below 50%)",
      text: "Nearly half of your audience scrolled away in the first 5 seconds. Consider placing the stunning 'After' shot right at the start, or add eye-catching text overlays like 'Wait for the end!' or a bold salon question.",
    });
  } else {
    recommendations.push({
      status: "success",
      title: "Strong Hook Rate!",
      text: "You successfully captured attention in the critical opening seconds. This indicates your cover frame and initial styling are compelling.",
    });
  }

  // Completion Rate Rule
  if (completion < 60) {
    recommendations.push({
      status: "warning",
      title: "Retention Drops Mid-Video",
      text: "Average watch time is low. Cut out unnecessary frames, speed up transitions, and make sure background music drops or changes to keep momentum high.",
    });
  } else {
    recommendations.push({
      status: "success",
      title: "Excellent Audience Retention",
      text: "Viewers watched a significant portion of your reel, which signals the algorithm that your content is high-quality and satisfying.",
    });
  }

  // Social Velocity Rule
  if (social < 40) {
    recommendations.push({
      status: "warning",
      title: "Needs Shareable Prompts",
      text: "Few viewers shared the video. Boost shareability by adding text callouts (e.g. 'Share with someone who needs this haircut') or giving specific advice on aftercare that viewers will want to save.",
    });
  }

  // Sentiment Rule
  if (sentiment < 60) {
    recommendations.push({
      status: "warning",
      title: "Engagement is Low",
      text: "Viewers aren't liking the post. Try highlighting the stylist's face or reacting naturally to the final transformation to make the video feel more authentic and personable.",
    });
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            rec.status === "critical"
              ? "bg-red-50/50 border-red-100 text-red-900"
              : rec.status === "warning"
              ? "bg-amber-50/50 border-amber-100 text-amber-900"
              : "bg-teal-50/50 border-teal-100 text-teal-900"
          }`}
        >
          <div className="flex gap-2.5 items-start">
            <span className="text-base leading-none">
              {rec.status === "critical" ? "🔴" : rec.status === "warning" ? "🟡" : "🟢"}
            </span>
            <div>
              <p className="text-xs font-bold font-sans leading-none mb-1">{rec.title}</p>
              <p className="text-xs opacity-90 leading-relaxed font-sans mt-1">{rec.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AudienceSegmentsMatrix({ personas }) {
  const groups = [
    {
      name: "Beauty & Trend Seekers",
      members: ["Priya", "Farah", "Meera", "Zoya"],
      emoji: "✨",
      color: "from-rose-500 to-pink-500",
      bg: "bg-rose-50/30 border-rose-100",
      text: "text-rose-900",
      bar: "bg-rose-500",
      description: "Interested in aesthetic details, luxury styling, and clean transformations."
    },
    {
      name: "Gen-Z & Active Youth",
      members: ["Riya", "Rohan", "Neha", "Sneha"],
      emoji: "⚡",
      color: "from-violet-500 to-indigo-500",
      bg: "bg-violet-50/30 border-violet-100",
      text: "text-violet-900",
      bar: "bg-violet-500",
      description: "Resonates with upbeat music, pricing info, and fast-paced trend reels."
    },
    {
      name: "Professionals & Creators",
      members: ["Kiran", "Arjun", "Vikram", "Mansi"],
      emoji: "👔",
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50/30 border-blue-100",
      text: "text-blue-900",
      bar: "bg-blue-500",
      description: "Analyzes styling techniques, products, and direct booking convenience."
    },
    {
      name: "Home & Family Makers",
      members: ["Ananya", "Divya", "Sanjay"],
      emoji: "🏡",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50/30 border-amber-100",
      text: "text-amber-900",
      bar: "bg-amber-500",
      description: "Values comfort, location accessibility, friendly vibe, and review credibility."
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group, index) => {
          const groupPersonas = personas.filter(p => group.members.includes(p.name));
          const count = groupPersonas.length;
          if (count === 0) return null;

          const avgWatch = Math.round(groupPersonas.reduce((acc, p) => acc + p.watch_through, 0) / count);
          const likeCount = groupPersonas.filter(p => p.liked).length;
          const likeRate = Math.round((likeCount / count) * 100);
          const shareCount = groupPersonas.filter(p => p.shared).length;
          const shareRate = Math.round((shareCount / count) * 100);

          return (
            <div key={index} className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${group.bg}`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{group.emoji}</span>
                  <span className={`font-bold text-sm ${group.text}`}>{group.name}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{group.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Watch-through</span>
                    <span className="font-bold text-charcoal">{avgWatch}%</span>
                  </div>
                  <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${group.bar}`} style={{ width: `${avgWatch}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-rose-500 font-bold">♥</span> {likeRate}% Likes
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-violet-500 font-bold">↗</span> {shareRate}% Shares
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ViralityDashboard() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [barsVisible, setBarsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const resultsRef = useRef(null);

  useEffect(() => {
    api.get(`/virality/results/${videoId}`)
      .then(({ data: d }) => {
        setData(d);
        if (d.personas?.length) {
          setTimeout(() => setBarsVisible(true), 300);
        }
      })
      .catch(() => {});
  }, [videoId]);

  const countedScore = useCountUp(
    data?.virality_score ?? null,
    1500,
    !!(data?.personas?.length)
  );
  const visibleComments = useStreamedComments(
    data?.personas ?? [],
    !!(data?.personas?.length)
  );

  async function runSimulation() {
    setError("");
    setSimulating(true);
    setBarsVisible(false);
    try {
      const { data: d } = await api.post(`/virality/simulate/${videoId}`, {}, { timeout: 120000 });
      setData(d);
      setTimeout(() => setBarsVisible(true), 400);
    } catch (err) {
      setError(err.response?.data?.detail || "Simulation failed");
    } finally {
      setSimulating(false);
    }
  }

  async function publishVideo() {
    setPublishing(true);
    try {
      await api.post(`/virality/publish/${videoId}`);
      setData(prev => ({ ...prev, status: "published" }));
    } catch (err) {
      setError(err.response?.data?.detail || "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  const hasResults = data?.personas?.length > 0;
  const diagnostic = data?.virality_score != null ? scoreDiagnostic(data.virality_score) : null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-gray-100 px-5 py-3 flex items-center gap-3">
        <Link to="/creator/dashboard" className="text-sm text-gray-400 hover:text-charcoal transition">
          ← Dashboard
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-medium text-charcoal truncate max-w-xs">
          {data?.title || "Video"}
        </span>
        {data?.status === "published" && (
          <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
            Published ✓
          </span>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {!hasResults && !simulating && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
            <div className="text-5xl">🎬</div>
            <div>
              <p className="font-display text-xl text-charcoal">Ready to simulate?</p>
              <p className="text-sm text-gray-400 mt-1">
                5 AI personas will watch your video and tell you how it'll perform.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}
            <button
              onClick={runSimulation}
              className="bg-burgundy text-white px-8 py-3 rounded-xl font-medium text-sm hover:bg-opacity-90 transition"
            >
              ✨ Run Simulation
            </button>
          </div>
        )}

        {simulating && <SimulatingView />}

        {hasResults && !simulating && (
          <div ref={resultsRef} className="space-y-5">
            {/* Score hero */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <ScoreRing score={barsVisible ? (data?.virality_score ?? 0) : 0} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-3xl text-charcoal leading-none">
                      {countedScore.toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Virality Score</p>
                  <p className={`text-lg font-display ${diagnostic?.color}`}>{diagnostic?.label}</p>
                  {diagnostic && (
                    <div className={`mt-2 text-xs rounded-xl px-3 py-2 border ${diagnostic.bg} text-gray-600 leading-relaxed`}>
                      {diagnostic.text}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border border-gray-100/80 p-1 bg-white rounded-2xl shadow-sm gap-1">
              {[
                { id: "overview", label: "Overview", emoji: "📊" },
                { id: "retention", label: "Retention Curve", emoji: "📈" },
                { id: "audience", label: "Audience Segments", emoji: "👥" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-burgundy text-white shadow-md shadow-burgundy/10 scale-[1.02]"
                      : "text-gray-400 hover:text-charcoal hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-5 animate-fadeIn">
                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Avg Watch Time", value: `${(data?.breakdown?.completion ?? 0).toFixed(0)}%`, emoji: "⏱️", color: "bg-amber-50 text-amber-700 border-amber-100/70" },
                    { label: "Like Rate", value: `${(data?.breakdown?.sentiment ?? 0).toFixed(0)}%`, emoji: "❤️", color: "bg-rose-50 text-rose-700 border-rose-100/70" },
                    { label: "Share Rate", value: `${(data?.breakdown?.social_velocity ?? 0).toFixed(0)}%`, emoji: "↗️", color: "bg-violet-50 text-violet-700 border-violet-100/70" },
                    { label: "Hook Rate", value: `${(data?.breakdown?.hook_rate ?? 0).toFixed(0)}%`, emoji: "🧲", color: "bg-teal-50 text-teal-700 border-teal-100/70" },
                  ].map((kpi, i) => (
                    <div key={i} className={`p-3.5 rounded-2xl border ${kpi.color} flex flex-col justify-between h-24 shadow-sm`}>
                      <div className="flex justify-between items-start">
                        <span className="text-lg leading-none">{kpi.emoji}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">{kpi.label}</span>
                      </div>
                      <span className="text-xl font-bold font-sans mt-2">{kpi.value}</span>
                    </div>
                  ))}
                </div>

                {/* Score Breakdown progress bars */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-charcoal mb-4 font-display">Score Breakdown</h3>
                  <BreakdownBars breakdown={data?.breakdown ?? {}} animate={barsVisible} />
                </div>

                {/* AI Actionable Recommendations */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-charcoal mb-4 font-display">AI Actionable Recommendations</h3>
                  <ActionableAdvice breakdown={data?.breakdown ?? {}} score={data?.virality_score ?? 0} />
                </div>
              </div>
            )}

            {activeTab === "retention" && (
              <div className="space-y-5 animate-fadeIn">
                {/* SVG Retention curve */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-charcoal mb-4 font-display">Audience Retention Curve</h3>
                  <RetentionCurveChart personas={data?.personas ?? []} durationSec={data?.duration_sec ?? 30} />
                </div>

                {/* Drop-off Timeline */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-charcoal mb-4 font-display">Drop-off Timeline</h3>
                  <DropoffTimeline personas={data?.personas ?? []} durationSec={data?.duration_sec ?? 30} />
                </div>
              </div>
            )}

            {activeTab === "audience" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Demographic Audience Segments matrix */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-charcoal mb-4 font-display">Demographic Performance Matrix</h3>
                  <AudienceSegmentsMatrix personas={data?.personas ?? []} />
                </div>

                {/* Individual persona reactions */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-charcoal mb-4 font-display">
                    Individual Audience Reactions
                    <span className="font-normal text-gray-400 ml-2">· Comments stream in</span>
                  </h3>
                  <div className="space-y-3">
                    {(data?.personas ?? []).map((p, i) => (
                      <PersonaCard
                        key={p.name}
                        persona={p}
                        showComment={!!visibleComments[p.name]}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={runSimulation}
                className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 text-sm font-medium hover:border-burgundy hover:text-burgundy transition"
              >
                ↺ Re-simulate
              </button>
              <button
                onClick={publishVideo}
                disabled={publishing || data?.status === "published"}
                className="flex-1 bg-charcoal text-white rounded-xl py-3 text-sm font-medium hover:bg-opacity-80 transition disabled:opacity-40"
              >
                {data?.status === "published" ? "Published ✓" : publishing ? "Publishing…" : "Publish to AURA →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
