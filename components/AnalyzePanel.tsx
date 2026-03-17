"use client";

import { useState, useCallback } from "react";
import ViralityMeter from "./ViralityMeter";
import LoadingCard from "./ui/LoadingCard";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,0.1)", border: "rgba(225,48,108,0.3)" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", bg: "rgba(10,102,194,0.1)", border: "rgba(10,102,194,0.3)" },
  { id: "twitter", label: "X / Twitter", color: "#e7e9ea", bg: "rgba(231,233,234,0.05)", border: "rgba(231,233,234,0.15)" },
  { id: "tiktok", label: "TikTok", color: "#FF0050", bg: "rgba(255,0,80,0.1)", border: "rgba(255,0,80,0.3)" },
  { id: "reddit", label: "Reddit", color: "#FF4500", bg: "rgba(255,69,0,0.1)", border: "rgba(255,69,0,0.3)" },
  { id: "facebook", label: "Facebook", color: "#1877F2", bg: "rgba(24,119,242,0.1)", border: "rgba(24,119,242,0.3)" },
  { id: "snapchat", label: "Snapchat", color: "#FFFC00", bg: "rgba(255,252,0,0.08)", border: "rgba(255,252,0,0.25)" },
];

interface SavedIdea { title: string; angle: string; hook: string; postType?: string; savedAt: string; }
interface ContentIdea { title: string; angle: string; hook: string; predictedEngagement: string; postType: string; viralityScore: number; }
interface Outlier { title: string; hook: string; likes: number; comments: number; shares: number; engagementRate: string; engagementRateRaw?: number; whyItWorked: string; contentType: string; keyTactic: string; timestamp?: number; }

interface AnalysisResults {
  error?: string;
  profile: {
    handle: string;
    fullName?: string;
    platform: string;
    niche: string;
    bio?: string;
    followerCount?: number;
    followingCount?: number;
    mediaCount?: number;
    followerEstimate: string;
    avgEngagement: string;
    avgEngagementRaw?: number;
    contentStyle: string;
    category?: string;
    profilePicUrl?: string | null;
  };
  stats?: {
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    engagementRating: { label: string; level: string };
    postingFrequency: { postsPerWeek: number; label: string };
    contentMix: { type: string; count: number; pct: number }[];
    totalPostsAnalyzed: number;
  };
  estimatedReach?: {
    low: number;
    high: number;
    pctOfFollowers: string;
    level: string;
    label: string;
  };
  estimatedPrice?: {
    low: number;
    mid: number;
    high: number;
    cpm: string;
    currency: string;
  };
  accountQuality?: {
    score: number;
    label: string;
    level: string;
    breakdown: {
      engagement: number;
      frequency: number;
      contentDiversity: number;
      volume: number;
      audienceSize: number;
    };
  };
  contentCategories?: string[];
  outliers: Outlier[];
  contentStrategy: string;
  contentIdeas: ContentIdea[];
  dataSource?: string;
}

interface Props {
  savedIdeas: SavedIdea[];
  setSavedIdeas: React.Dispatch<React.SetStateAction<SavedIdea[]>>;
  setCreatePrefill: (prefill: { topic: string; angle: string; hook: string; postType: string }) => void;
}

/* ── Helpers ── */
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}
function fmtPrice(n: number): string {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return "$" + n.toLocaleString();
}

function levelColor(level: string): string {
  switch (level) {
    case "excellent": return "#22c55e";
    case "good": return "#84c33b";
    case "average": return "#f59e0b";
    default: return "#ef4444";
  }
}
function levelBg(level: string): string {
  switch (level) {
    case "excellent": return "rgba(34,197,94,0.12)";
    case "good": return "rgba(132,195,59,0.12)";
    case "average": return "rgba(245,158,11,0.12)";
    default: return "rgba(239,68,68,0.12)";
  }
}
function gaugePos(level: string): number {
  switch (level) { case "excellent": return 85; case "good": return 62; case "average": return 38; default: return 15; }
}

/* ── Card wrapper ── */
function Card({ children, glow, style }: { children: React.ReactNode; glow?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#0c1018", border: "1px solid #1a2234", borderRadius: 14, padding: 22,
      boxShadow: glow ? `0 0 30px ${glow}` : "0 2px 12px rgba(0,0,0,0.3)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Section title ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568",
      letterSpacing: 2.5, marginBottom: 16, textTransform: "uppercase",
    }}>{children}</div>
  );
}

/* ── Badge ── */
function Badge({ label, level, size = "md" }: { label: string; level: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: { p: "2px 8px", fs: 10 }, md: { p: "4px 12px", fs: 12 }, lg: { p: "6px 16px", fs: 14 } };
  const s = sizes[size];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: s.p, borderRadius: 6, fontSize: s.fs,
      fontFamily: "'DM Mono', monospace", fontWeight: 700,
      color: "#fff", background: levelColor(level),
    }}>{label}</span>
  );
}

/* ── Big Stat Card (HypeAuditor style) ── */
function BigStat({ label, value, sub, badge, badgeLevel, icon, accentColor }: {
  label: string; value: string; sub?: string; badge?: string; badgeLevel?: string; icon?: string; accentColor?: string;
}) {
  return (
    <Card style={{ position: "relative", overflow: "hidden" }}>
      {accentColor && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accentColor }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 2 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 32, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", lineHeight: 1 }}>
          {value}
        </div>
        {badge && badgeLevel && <Badge label={badge} level={badgeLevel} />}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#4a5568", fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

/* ── Engagement Gauge (HypeAuditor 6-segment style) ── */
function EngagementGauge({ level, rate }: { level: string; rate: string }) {
  const pos = gaugePos(level);
  const segments = [
    { id: "below", label: "" },
    { id: "average", label: "" },
    { id: "good", label: "" },
    { id: "excellent", label: "" },
  ];
  const activeIdx = segments.findIndex(s => s.id === level);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
        <span style={{ fontSize: 42, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: levelColor(level), lineHeight: 1 }}>
          {rate}
        </span>
        <Badge label={segments.find(s => s.id === level)?.id === "below" ? "Below Average" : level.charAt(0).toUpperCase() + level.slice(1)} level={level} size="lg" />
      </div>
      <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 20, lineHeight: 1.6 }}>
        Engagement rate is <span style={{ color: levelColor(level), fontWeight: 600 }}>
          {level === "below" ? "below average" : level}
        </span> compared to accounts of similar size, indicating that the content resonates
        {level === "excellent" || level === "good" ? " well" : " at a moderate level"} with their audience.
      </div>
      {/* Gauge bar - HypeAuditor style */}
      <div style={{ display: "flex", gap: 3, height: 20, borderRadius: 6, overflow: "hidden" }}>
        {segments.map((seg, i) => (
          <div key={seg.id} style={{
            flex: i === activeIdx ? 2 : 1, height: "100%",
            background: i === activeIdx ? levelColor(seg.id) : "#1a2234",
            borderRadius: i === 0 ? "6px 0 0 6px" : i === segments.length - 1 ? "0 6px 6px 0" : 0,
            transition: "all 0.4s ease",
          }} />
        ))}
      </div>
      {/* Triangle pointer */}
      <div style={{ position: "relative", height: 16, marginTop: 4 }}>
        <div style={{
          position: "absolute", left: `${pos}%`, transform: "translateX(-50%)",
          width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
          borderBottom: `10px solid ${levelColor(level)}`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Low</span>
        <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Excellent</span>
      </div>
    </div>
  );
}

/* ── SVG Donut Chart ── */
function DonutChart({ mix }: { mix: { type: string; count: number; pct: number }[] }) {
  const typeColors: Record<string, string> = {
    carousel: "#8b5cf6", reel: "#ec4899", image: "#06b6d4", video: "#f59e0b", text: "#22c55e",
  };
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {mix.map((m) => {
          const segLen = (m.pct / 100) * circumference;
          const color = typeColors[m.type] || "#64748b";
          const el = (
            <circle
              key={m.type}
              cx="80" cy="80" r={radius}
              fill="none" stroke={color} strokeWidth="24"
              strokeDasharray={`${segLen} ${circumference - segLen}`}
              strokeDashoffset={-offset}
              style={{ transition: "all 0.6s ease" }}
            />
          );
          offset += segLen;
          return el;
        })}
        <text x="80" y="74" textAnchor="middle" fill="#e2e8f0" fontSize="22" fontFamily="'Syne', sans-serif" fontWeight="800">
          {mix.reduce((s, m) => s + m.count, 0)}
        </text>
        <text x="80" y="94" textAnchor="middle" fill="#4a5568" fontSize="10" fontFamily="'DM Mono', monospace">
          posts
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mix.map((m) => (
          <div key={m.type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: typeColors[m.type] || "#64748b" }} />
            <span style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize", fontWeight: 500 }}>
              {m.type}
            </span>
            <span style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginLeft: "auto" }}>
              {m.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Price Range Slider (HypeAuditor style) ── */
function PriceSlider({ low, mid, high }: { low: number; mid: number; high: number }) {
  const range = high - low;
  const midPos = range > 0 ? ((mid - low) / range) * 100 : 50;
  return (
    <div>
      <div style={{ position: "relative", height: 28, marginBottom: 8 }}>
        {/* Track */}
        <div style={{
          position: "absolute", top: 10, left: 0, right: 0, height: 8, borderRadius: 4,
          background: "linear-gradient(90deg, #22c55e 0%, #84c33b 40%, #f59e0b 70%, #ef4444 100%)",
          opacity: 0.8,
        }} />
        {/* Thumb */}
        <div style={{
          position: "absolute", top: 4, left: `${midPos}%`, transform: "translateX(-50%)",
          width: 20, height: 20, borderRadius: "50%", background: "#06b6d4",
          border: "3px solid #0c1018", boxShadow: "0 0 10px rgba(6,182,212,0.5)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Great deal</span>
        <span style={{ fontSize: 12, color: "#06b6d4", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtPrice(mid)}</span>
        <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Suboptimal</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace" }}>Min {fmtPrice(low)}</span>
        <span style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace" }}>Max {fmtPrice(high)}</span>
      </div>
    </div>
  );
}

/* ── Account Quality Score Circle ── */
function QualityCircle({ score, label, level }: { score: number; label: string; level: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = levelColor(level);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#1a2234" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: "all 0.8s ease" }}
        />
        <text x="65" y="58" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontFamily="'Syne', sans-serif" fontWeight="800">
          {score}
        </text>
        <text x="65" y="78" textAnchor="middle" fill={color} fontSize="11" fontFamily="'DM Mono', monospace" fontWeight="700">
          {label}
        </text>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
          Account Quality Score
        </div>
        <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          Based on engagement rate, posting frequency, content diversity, volume, and audience size.
        </div>
      </div>
    </div>
  );
}

/* ── Quality Breakdown Bar ── */
function QualityBreakdown({ breakdown }: { breakdown: { engagement: number; frequency: number; contentDiversity: number; volume: number; audienceSize: number } }) {
  const items = [
    { label: "Engagement", value: breakdown.engagement, max: 30, color: "#22c55e" },
    { label: "Frequency", value: breakdown.frequency, max: 20, color: "#06b6d4" },
    { label: "Content Mix", value: breakdown.contentDiversity, max: 15, color: "#8b5cf6" },
    { label: "Volume", value: breakdown.volume, max: 20, color: "#f59e0b" },
    { label: "Audience", value: breakdown.audienceSize, max: 15, color: "#ec4899" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", width: 90, flexShrink: 0 }}>{item.label}</span>
          <div style={{ flex: 1, height: 8, background: "#1a2234", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, background: item.color,
              width: `${(item.value / item.max) * 100}%`,
              transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace", width: 40, textAlign: "right" }}>
            {item.value}/{item.max}
          </span>
        </div>
      ))}
    </div>
  );
}


/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */

export default function AnalyzePanel({ savedIdeas, setSavedIdeas, setCreatePrefill }: Props) {
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [activeOutlier, setActiveOutlier] = useState(0);
  const [step, setStep] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "ideas">("overview");

  const analyze = useCallback(async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setResults(null);
    setActiveOutlier(0);
    setActiveTab("overview");

    const plat = PLATFORMS.find((p) => p.id === platform);
    try {
      setStep("Fetching profile data...");
      await new Promise(r => setTimeout(r, 400));
      setStep("Analyzing content patterns...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim(), platform: plat?.label }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      setStep("Generating intelligence report...");
      const parsed = await res.json();
      setResults(parsed);
    } catch (e) {
      setResults({ error: e instanceof Error ? e.message : "Analysis failed. Try again." } as AnalysisResults);
    }
    setLoading(false);
    setStep("");
  }, [handle, platform]);

  const useIdea = (idea: ContentIdea) => {
    setCreatePrefill({ topic: idea.title, angle: idea.angle, hook: idea.hook, postType: idea.postType });
  };

  const saveIdea = (idea: ContentIdea) => {
    setSavedIdeas((prev) => [...prev, { ...idea, savedAt: new Date().toLocaleTimeString() }]);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, height: "calc(100vh - 120px)", overflow: "hidden" }}>
      {/* ═══ LEFT PANEL ═══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 4 }}>
        <Card>
          <SectionTitle>Target Profile</SectionTitle>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>HANDLE / URL</label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="@username or profile URL"
              style={{ width: "100%", background: "#060810", border: "1px solid #1a2234", borderRadius: 8, padding: "11px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>PLATFORM</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)} style={{ padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: platform === p.id ? p.bg : "transparent", border: `1px solid ${platform === p.id ? p.border : "#1a2234"}`, color: platform === p.id ? p.color : "#4a5568", fontSize: 12, fontFamily: "'DM Mono', monospace", transition: "all 0.2s", textAlign: "center" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={loading || !handle.trim()}
            style={{ width: "100%", padding: "13px", borderRadius: 10, cursor: loading || !handle.trim() ? "not-allowed" : "pointer", background: loading || !handle.trim() ? "#0d1017" : "linear-gradient(135deg, #0891b2, #06b6d4)", border: "none", color: loading ? "#4a5568" : "#000000", fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: 1.5, transition: "all 0.2s" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="animate-spin" style={{ width: 14, height: 14, border: "2px solid #4a5568", borderTopColor: "#06b6d4", borderRadius: "50%", display: "inline-block" }} />
                {step || "ANALYZING..."}
              </span>
            ) : "RUN ANALYSIS →"}
          </button>
        </Card>

        {/* Profile Card */}
        {results && !results.error && (
          <Card glow="rgba(6,182,212,0.06)" style={{ textAlign: "center", borderColor: "rgba(6,182,212,0.15)" }}>
            {/* Avatar with gradient ring */}
            <div style={{
              width: 84, height: 84, borderRadius: "50%", margin: "0 auto 14px",
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)",
              padding: 3, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: results.profile.profilePicUrl ? `url(${results.profile.profilePicUrl}) center/cover` : "linear-gradient(135deg, #0891b2, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800,
              }}>
                {!results.profile.profilePicUrl && results.profile.handle[0]?.toUpperCase()}
              </div>
            </div>
            <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
              {results.profile.fullName || results.profile.handle}
            </div>
            <div style={{ fontSize: 13, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>
              @{results.profile.handle}
            </div>
            {results.profile.bio && (
              <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginTop: 8, lineHeight: 1.5, maxHeight: 50, overflow: "hidden" }}>
                {results.profile.bio}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a2234" }}>
              <div>
                <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0" }}>
                  {results.profile.followerCount ? fmtNum(results.profile.followerCount) : results.profile.followerEstimate}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Followers</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0" }}>
                  {results.profile.followingCount ? fmtNum(results.profile.followingCount) : "—"}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Following</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0" }}>
                  {results.profile.mediaCount ? fmtNum(results.profile.mediaCount) : "—"}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Posts</div>
              </div>
            </div>
            {results.profile.category && (
              <div style={{ marginTop: 14 }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 20, fontSize: 11,
                  fontFamily: "'DM Mono', monospace", background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4",
                }}>{results.profile.category}</span>
              </div>
            )}
          </Card>
        )}

        {/* Saved Ideas */}
        {savedIdeas.length > 0 && (
          <Card>
            <SectionTitle>Saved Ideas · {savedIdeas.length}</SectionTitle>
            {savedIdeas.map((idea, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < savedIdeas.length - 1 ? "1px solid #1a2234" : "none" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{idea.title}</div>
                <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>saved {idea.savedAt}</div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={{ overflowY: "auto", paddingRight: 4 }}>
        {/* Empty state */}
        {!results && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, opacity: 0.4 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", border: "2px solid #1a2234", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🔍</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4a5568", textAlign: "center" }}>
              Enter a handle and run analysis<br />to see competitor intelligence
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#0c1018", border: "1px solid #1a2234", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div className="animate-pulse" style={{ width: 56, height: 56, borderRadius: "50%", background: "#1a2234" }} />
                <div style={{ flex: 1 }}>
                  <div className="animate-pulse" style={{ height: 16, width: "60%", background: "#1a2234", borderRadius: 4, marginBottom: 8 }} />
                  <div className="animate-pulse" style={{ height: 12, width: "40%", background: "#1a2234", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse" style={{ height: 90, background: "#1a2234", borderRadius: 10 }} />
                ))}
              </div>
            </div>
            {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {results?.error && (
          <div style={{ padding: 20, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{results.error}</div>
        )}

        {/* ═══ RESULTS ═══ */}
        {results && !results.error && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Tab Nav */}
            <div style={{ display: "flex", gap: 0, background: "#0c1018", border: "1px solid #1a2234", borderRadius: 10, padding: 4 }}>
              {(["overview", "posts", "ideas"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: "11px 16px", borderRadius: 8, cursor: "pointer", border: "none",
                  background: activeTab === tab ? "rgba(6,182,212,0.12)" : "transparent",
                  color: activeTab === tab ? "#06b6d4" : "#4a5568",
                  fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 700, letterSpacing: 1.5,
                  transition: "all 0.2s", textTransform: "uppercase",
                }}>
                  {tab === "overview" ? "📊 OVERVIEW" : tab === "posts" ? "📝 TOP POSTS" : "💡 AI IDEAS"}
                </button>
              ))}
            </div>

            {/* ════ OVERVIEW TAB ════ */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* 4 Key Metric Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  <BigStat
                    label="ENGAGEMENT" icon="⚡"
                    value={results.profile.avgEngagement}
                    badge={results.stats?.engagementRating.label}
                    badgeLevel={results.stats?.engagementRating.level}
                    accentColor={results.stats ? levelColor(results.stats.engagementRating.level) : undefined}
                  />
                  <BigStat label="AVG LIKES" icon="❤️" value={results.stats ? fmtNum(results.stats.avgLikes) : "—"} accentColor="#ef4444" />
                  <BigStat label="AVG COMMENTS" icon="💬" value={results.stats ? fmtNum(results.stats.avgComments) : "—"} accentColor="#3b82f6" />
                  <BigStat
                    label="POSTING FREQ" icon="📅"
                    value={results.stats?.postingFrequency.label || "—"}
                    accentColor="#8b5cf6"
                  />
                </div>

                {/* Engagement Rate + Estimated Reach — side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {results.stats && (
                    <Card glow="rgba(6,182,212,0.04)">
                      <SectionTitle>Engagement Rate</SectionTitle>
                      <EngagementGauge level={results.stats.engagementRating.level} rate={results.profile.avgEngagement} />
                    </Card>
                  )}
                  {results.estimatedReach && (
                    <Card glow="rgba(34,197,94,0.04)">
                      <SectionTitle>Estimated Reach</SectionTitle>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
                        <span style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", lineHeight: 1 }}>
                          {fmtNum(results.estimatedReach.low)}–{fmtNum(results.estimatedReach.high)}
                        </span>
                        <Badge label={results.estimatedReach.label} level={results.estimatedReach.level} />
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                        Posts are seen by an estimated {results.estimatedReach.pctOfFollowers}% of followers.
                        {results.estimatedReach.level === "excellent" || results.estimatedReach.level === "good"
                          ? " This rate is higher than average, showing a substantial portion of the audience is reached."
                          : " A moderate portion of the audience is reached per post."}
                      </div>
                    </Card>
                  )}
                </div>

                {/* 4 Avg Stats with badges (like HypeAuditor) */}
                {results.stats && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                      { label: "Avg. Likes", value: fmtNum(results.stats.avgLikes), level: results.stats.avgLikes > 5000 ? "excellent" : results.stats.avgLikes > 1000 ? "good" : results.stats.avgLikes > 200 ? "average" : "below" },
                      { label: "Avg. Comments", value: fmtNum(results.stats.avgComments), level: results.stats.avgComments > 200 ? "excellent" : results.stats.avgComments > 50 ? "good" : results.stats.avgComments > 10 ? "average" : "below" },
                      { label: "Avg. Shares", value: fmtNum(results.stats.avgShares), level: results.stats.avgShares > 100 ? "excellent" : results.stats.avgShares > 20 ? "good" : results.stats.avgShares > 5 ? "average" : "below" },
                      { label: "Posts Analyzed", value: String(results.stats.totalPostsAnalyzed), level: "good" },
                    ].map((s) => (
                      <Card key={s.label}>
                        <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>{s.label}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0" }}>{s.value}</span>
                          <Badge label={s.level === "excellent" ? "Excellent" : s.level === "good" ? "Good" : s.level === "average" ? "Average" : "Below"} level={s.level} size="sm" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Content Categories */}
                {results.contentCategories && results.contentCategories.length > 0 && (
                  <Card>
                    <SectionTitle>Content Categories</SectionTitle>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {results.contentCategories.map((cat, i) => {
                        const icons = ["🚗", "💎", "🏎️", "📸", "🌍", "🏷️", "🎬", "⚡"];
                        return (
                          <span key={i} style={{
                            padding: "10px 18px", borderRadius: 10, fontSize: 13,
                            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                            background: "#0a0e16", border: "1px solid #1a2234", color: "#c8d0dc",
                            display: "flex", alignItems: "center", gap: 8,
                          }}>
                            <span style={{ fontSize: 16 }}>{icons[i % icons.length]}</span>
                            {cat}
                          </span>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Content Mix + Account Quality — side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {results.stats && (
                    <Card>
                      <SectionTitle>Content Mix</SectionTitle>
                      <DonutChart mix={results.stats.contentMix} />
                    </Card>
                  )}
                  {results.accountQuality && (
                    <Card glow={`${levelColor(results.accountQuality.level)}08`}>
                      <SectionTitle>Account Quality</SectionTitle>
                      <QualityCircle score={results.accountQuality.score} label={results.accountQuality.label} level={results.accountQuality.level} />
                      <div style={{ marginTop: 18 }}>
                        <QualityBreakdown breakdown={results.accountQuality.breakdown} />
                      </div>
                    </Card>
                  )}
                </div>

                {/* Price Estimation (HypeAuditor style) */}
                {results.estimatedPrice && (
                  <Card>
                    <SectionTitle>Price & Performance Evaluation</SectionTitle>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
                      <span style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", lineHeight: 1 }}>
                        {fmtPrice(results.estimatedPrice.low)}–{fmtPrice(results.estimatedPrice.high)}
                      </span>
                      <Badge label="Expected price range" level="good" />
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 20, lineHeight: 1.6 }}>
                      At ${results.estimatedPrice.cpm} per thousand impressions, this price level offers a reasonable balance between cost and potential media impact.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      <div style={{ padding: 12, background: "#0a0e16", borderRadius: 8 }}>
                        <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>Cost Per Mille (CPM)</div>
                        <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>${results.estimatedPrice.cpm}</div>
                      </div>
                      <div style={{ padding: 12, background: "#0a0e16", borderRadius: 8 }}>
                        <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>Est. Integration Price</div>
                        <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{fmtPrice(results.estimatedPrice.mid)}</div>
                      </div>
                    </div>
                    <PriceSlider low={results.estimatedPrice.low} mid={results.estimatedPrice.mid} high={results.estimatedPrice.high} />
                  </Card>
                )}

                {/* Content Strategy */}
                <Card>
                  <SectionTitle>Content Strategy</SectionTitle>
                  <div style={{ fontSize: 14, color: "#c8d0dc", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
                    {results.contentStrategy}
                  </div>
                </Card>

                {/* Intelligence Report */}
                <Card>
                  <SectionTitle>Intelligence Report</SectionTitle>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 16, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>Account Analyzed</div>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                        We analyzed this account using {results.stats?.totalPostsAnalyzed || "multiple"} recent posts and 40+ parameters.
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 12 }}>WHAT WE ANALYZED</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      "Engagement Rate", "Content Strategy", "Posting Frequency", "Content Mix",
                      "Top Performing Posts", "Audience Tactics", "Hook Patterns", "Virality Potential",
                      "Account Quality Score", "Estimated Reach", "Price Evaluation", "Content Categories"
                    ].map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                        <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 700 }}>✓</span>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {results.dataSource === "estimated" && (
                  <div style={{ padding: 14, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'DM Sans', sans-serif" }}>Estimates only — connect this platform for real data</span>
                  </div>
                )}
              </div>
            )}

            {/* ════ POSTS TAB ════ */}
            {activeTab === "posts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>Top Performing Content · {results.outliers.length} Posts</SectionTitle>
                  <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    {results.outliers.map((_, i) => (
                      <button key={i} onClick={() => setActiveOutlier(i)} style={{
                        padding: "9px 18px", borderRadius: 8, cursor: "pointer",
                        background: activeOutlier === i ? "rgba(6,182,212,0.12)" : "#060810",
                        border: `1px solid ${activeOutlier === i ? "rgba(6,182,212,0.4)" : "#1a2234"}`,
                        color: activeOutlier === i ? "#06b6d4" : "#4a5568",
                        fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 700,
                        transition: "all 0.2s",
                      }}>
                        POST {i + 1}
                      </button>
                    ))}
                  </div>

                  {results.outliers[activeOutlier] && (() => {
                    const post = results.outliers[activeOutlier];
                    return (
                      <div className="fade-in">
                        <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{post.title}</div>
                        <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 18, fontStyle: "italic", borderLeft: "3px solid #1a2234", paddingLeft: 14 }}>
                          &ldquo;{post.hook}&rdquo;
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
                          {[
                            { label: "LIKES", val: post.likes?.toLocaleString(), icon: "❤️", color: "#ef4444" },
                            { label: "COMMENTS", val: post.comments?.toLocaleString(), icon: "💬", color: "#3b82f6" },
                            { label: "SHARES", val: post.shares?.toLocaleString(), icon: "🔁", color: "#8b5cf6" },
                            { label: "ENG. RATE", val: post.engagementRate, icon: "📈", color: "#22c55e" },
                          ].map(({ label, val, icon, color }) => (
                            <div key={label} style={{ background: "#0a0e16", borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${color}` }}>
                              <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{icon} {label}</div>
                              <div style={{ fontSize: 22, color: "#e2e8f0", fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: 12, padding: 18 }}>
                          <div style={{ fontSize: 11, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginBottom: 10, letterSpacing: 2 }}>💡 WHY IT WORKED</div>
                          <div style={{ fontSize: 14, color: "#c8d0dc", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>{post.whyItWorked}</div>
                          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontWeight: 600 }}>
                              ⚡ {post.keyTactic}
                            </span>
                            <span style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#0a0e16", border: "1px solid #1a2234", color: "#94a3b8", textTransform: "capitalize" }}>
                              📷 {post.contentType}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </div>
            )}

            {/* ════ IDEAS TAB ════ */}
            {activeTab === "ideas" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, padding: "0 4px" }}>
                  AI-GENERATED IDEAS · {results.contentIdeas?.length}
                </div>
                {results.contentIdeas?.map((idea, i) => (
                  <Card
                    key={i}
                    style={{ transition: "border-color 0.2s, transform 0.2s", cursor: "default" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{idea.title}</div>
                        <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>{idea.angle}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => saveIdea(idea)} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #1a2234", color: "#4a5568", fontSize: 11, fontFamily: "'DM Mono', monospace", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#4a5568"; e.currentTarget.style.color = "#94a3b8"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2234"; e.currentTarget.style.color = "#4a5568"; }}
                        >SAVE</button>
                        <button onClick={() => useIdea(idea)} style={{ padding: "6px 14px", borderRadius: 6, cursor: "pointer", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.1)"; }}
                        >USE →</button>
                      </div>
                    </div>
                    {idea.hook && (
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 12, fontStyle: "italic", borderLeft: "2px solid #1a2234", paddingLeft: 12 }}>
                        &ldquo;{idea.hook}&rdquo;
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <ViralityMeter score={idea.viralityScore} />
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700,
                        background: idea.predictedEngagement === "viral" ? "rgba(34,197,94,0.12)" : idea.predictedEngagement === "high" ? "rgba(6,182,212,0.12)" : "rgba(245,158,11,0.12)",
                        color: idea.predictedEngagement === "viral" ? "#22c55e" : idea.predictedEngagement === "high" ? "#06b6d4" : "#f59e0b",
                      }}>
                        {idea.predictedEngagement?.toUpperCase()}
                      </span>
                      <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#0a0e16", border: "1px solid #1a2234", color: "#64748b", textTransform: "capitalize" }}>
                        {idea.postType}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
