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

/* ── Helper: format large numbers ── */
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/* ── Helper: engagement level color ── */
function levelColor(level: string): string {
  switch (level) {
    case "excellent": return "#22c55e";
    case "good": return "#06b6d4";
    case "average": return "#f59e0b";
    default: return "#ef4444";
  }
}
function levelBg(level: string): string {
  switch (level) {
    case "excellent": return "rgba(34,197,94,0.1)";
    case "good": return "rgba(6,182,212,0.1)";
    case "average": return "rgba(245,158,11,0.1)";
    default: return "rgba(239,68,68,0.1)";
  }
}

/* ── Helper: gauge position (0-100) for engagement ── */
function engGaugePos(level: string): number {
  switch (level) {
    case "excellent": return 88;
    case "good": return 65;
    case "average": return 40;
    default: return 18;
  }
}

/* ── Badge component ── */
function Badge({ label, level }: { label: string; level: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 11,
      fontFamily: "'DM Mono', monospace", fontWeight: 600,
      color: levelColor(level), background: levelBg(level),
      border: `1px solid ${levelColor(level)}33`,
    }}>{label}</span>
  );
}

/* ── Stat Card (like HypeAuditor) ── */
function StatCard({ label, value, badge, badgeLevel }: { label: string; value: string; badge?: string; badgeLevel?: string }) {
  return (
    <div style={{
      background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0" }}>{value}</div>
        {badge && badgeLevel && <Badge label={badge} level={badgeLevel} />}
      </div>
    </div>
  );
}

/* ── Content Type Bar ── */
function ContentMixBar({ mix }: { mix: { type: string; count: number; pct: number }[] }) {
  const typeColors: Record<string, string> = {
    carousel: "#8b5cf6", reel: "#ec4899", image: "#06b6d4", video: "#f59e0b",
  };
  return (
    <div>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 10, marginBottom: 10 }}>
        {mix.map((m) => (
          <div key={m.type} style={{ width: `${m.pct}%`, background: typeColors[m.type] || "#64748b", minWidth: 4 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {mix.map((m) => (
          <div key={m.type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: typeColors[m.type] || "#64748b" }} />
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace", textTransform: "capitalize" }}>
              {m.type} {m.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Engagement Gauge (like HypeAuditor) ── */
function EngagementGauge({ level, rate }: { level: string; rate: string }) {
  const pos = engGaugePos(level);
  const segments = ["below", "average", "good", "excellent"];
  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {segments.map((seg) => (
          <div key={seg} style={{
            flex: 1, height: 8, borderRadius: 4,
            background: seg === level
              ? levelColor(level)
              : `${levelColor(seg)}22`,
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <div style={{ position: "relative", height: 20 }}>
        <div style={{
          position: "absolute", left: `${pos}%`, transform: "translateX(-50%)",
          width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
          borderBottom: `8px solid ${levelColor(level)}`, top: 0,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Low</span>
        <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Excellent</span>
      </div>
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
        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 16 }}>TARGET PROFILE</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>HANDLE / URL</label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="@username or profile URL"
              style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>PLATFORM</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)} style={{ padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: platform === p.id ? p.bg : "transparent", border: `1px solid ${platform === p.id ? p.border : "#1e2535"}`, color: platform === p.id ? p.color : "#64748b", fontSize: 12, fontFamily: "'DM Mono', monospace", transition: "all 0.2s", textAlign: "center" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={loading || !handle.trim()}
            style={{ width: "100%", padding: "12px", borderRadius: 10, cursor: loading || !handle.trim() ? "not-allowed" : "pointer", background: loading || !handle.trim() ? "#0d1017" : "linear-gradient(135deg, #0891b2, #0e7490)", border: "none", color: loading ? "#4a5568" : "#000000", fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: 1.5, transition: "all 0.2s", position: "relative", overflow: "hidden" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="animate-spin" style={{ width: 14, height: 14, border: "2px solid #4a5568", borderTopColor: "#06b6d4", borderRadius: "50%", display: "inline-block" }} />
                {step || "ANALYZING..."}
              </span>
            ) : (
              "RUN ANALYSIS →"
            )}
          </button>
        </div>

        {/* Profile Card (show when results loaded) */}
        {results && !results.error && (
          <div className="fade-in" style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20, textAlign: "center" }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
              background: results.profile.profilePicUrl ? `url(${results.profile.profilePicUrl}) center/cover` : "linear-gradient(135deg, #0891b2, #6366f1)",
              border: "3px solid #1e2535",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, color: "#fff",
            }}>
              {!results.profile.profilePicUrl && results.profile.handle[0]?.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
              {results.profile.fullName || results.profile.handle}
            </div>
            <div style={{ fontSize: 13, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              @{results.profile.handle}
            </div>
            {results.profile.bio && (
              <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginTop: 8, lineHeight: 1.5, maxHeight: 60, overflow: "hidden" }}>
                {results.profile.bio}
              </div>
            )}
            {/* Quick stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e2535" }}>
              <div>
                <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
                  {results.profile.followerCount ? fmtNum(results.profile.followerCount) : results.profile.followerEstimate}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Followers</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
                  {results.profile.followingCount ? fmtNum(results.profile.followingCount) : "—"}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Following</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
                  {results.profile.mediaCount ? fmtNum(results.profile.mediaCount) : "—"}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Posts</div>
              </div>
            </div>
            {/* Category badge */}
            {results.profile.category && (
              <div style={{ marginTop: 12 }}>
                <span style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11,
                  fontFamily: "'DM Mono', monospace", background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4",
                }}>{results.profile.category}</span>
              </div>
            )}
          </div>
        )}

        {/* Saved Ideas */}
        {savedIdeas.length > 0 && (
          <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>SAVED IDEAS · {savedIdeas.length}</div>
            {savedIdeas.map((idea, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < savedIdeas.length - 1 ? "1px solid #1e2535" : "none" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{idea.title}</div>
                <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>saved {idea.savedAt}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={{ overflowY: "auto", paddingRight: 4 }}>
        {/* Empty state */}
        {!results && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.4 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🔍</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4a5568", textAlign: "center" }}>
              Enter a handle and run analysis<br />to see competitor intelligence
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div className="animate-pulse" style={{ width: 56, height: 56, borderRadius: "50%", background: "#1e2535" }} />
                <div style={{ flex: 1 }}>
                  <div className="animate-pulse" style={{ height: 16, width: "60%", background: "#1e2535", borderRadius: 4, marginBottom: 8 }} />
                  <div className="animate-pulse" style={{ height: 12, width: "40%", background: "#1e2535", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse" style={{ height: 70, background: "#1e2535", borderRadius: 10 }} />
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

            {/* ── TAB NAV ── */}
            <div style={{ display: "flex", gap: 0, background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 10, padding: 4 }}>
              {(["overview", "posts", "ideas"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "10px 16px", borderRadius: 8, cursor: "pointer", border: "none",
                    background: activeTab === tab ? "rgba(6,182,212,0.1)" : "transparent",
                    color: activeTab === tab ? "#06b6d4" : "#4a5568",
                    fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 1,
                    transition: "all 0.2s", textTransform: "uppercase",
                  }}
                >
                  {tab === "overview" ? "📊 Overview" : tab === "posts" ? "📝 Top Posts" : "💡 AI Ideas"}
                </button>
              ))}
            </div>

            {/* ════ OVERVIEW TAB ════ */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Key Metrics Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  <StatCard
                    label="AVG ENGAGEMENT"
                    value={results.profile.avgEngagement}
                    badge={results.stats?.engagementRating.label}
                    badgeLevel={results.stats?.engagementRating.level}
                  />
                  <StatCard
                    label="AVG LIKES"
                    value={results.stats ? fmtNum(results.stats.avgLikes) : "—"}
                  />
                  <StatCard
                    label="AVG COMMENTS"
                    value={results.stats ? fmtNum(results.stats.avgComments) : "—"}
                  />
                  <StatCard
                    label="POSTING FREQ"
                    value={results.stats?.postingFrequency.label || "—"}
                  />
                </div>

                {/* Engagement Rate Section (HypeAuditor style) */}
                {results.stats && (
                  <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>ENGAGEMENT RATE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <span style={{ fontSize: 32, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: levelColor(results.stats.engagementRating.level) }}>
                        {results.profile.avgEngagement}
                      </span>
                      <Badge label={results.stats.engagementRating.label} level={results.stats.engagementRating.level} />
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 16, lineHeight: 1.5 }}>
                      Engagement rate is{" "}
                      <span style={{ color: levelColor(results.stats.engagementRating.level) }}>
                        {results.stats.engagementRating.label.toLowerCase()}
                      </span>
                      {" "}compared to accounts of similar size, indicating that the content resonates
                      {results.stats.engagementRating.level === "excellent" || results.stats.engagementRating.level === "good"
                        ? " well with their audience."
                        : " at a moderate level with their audience."}
                    </div>
                    <EngagementGauge level={results.stats.engagementRating.level} rate={results.profile.avgEngagement} />
                  </div>
                )}

                {/* Content Categories */}
                {results.contentCategories && results.contentCategories.length > 0 && (
                  <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>CONTENT CATEGORIES</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {results.contentCategories.map((cat, i) => (
                        <span key={i} style={{
                          padding: "8px 16px", borderRadius: 8, fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                          background: "#060810", border: "1px solid #1e2535", color: "#94a3b8",
                          display: "flex", alignItems: "center", gap: 8,
                        }}>
                          <span style={{ fontSize: 14 }}>
                            {["🏷️", "🎯", "📸", "🎬", "💼", "🌟"][i % 6]}
                          </span>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Summary — 2x2 stat cards */}
                {results.stats && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>CONTENT MIX</div>
                      <ContentMixBar mix={results.stats.contentMix} />
                      <div style={{ marginTop: 14, fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                        Based on {results.stats.totalPostsAnalyzed} recent posts analyzed
                      </div>
                    </div>
                    <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>CONTENT STRATEGY</div>
                      <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                        {results.contentStrategy}
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Intelligence Summary */}
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>
                    INTELLIGENCE REPORT
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#22c55e", marginBottom: 4 }}>Account Analyzed</div>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                        We analyzed this account using {results.stats?.totalPostsAnalyzed || "multiple"} recent posts and profile data.
                      </div>
                    </div>
                  </div>
                  {/* What we checked */}
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1, marginBottom: 10, marginTop: 16 }}>WHAT WE ANALYZED</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      "Engagement Rate", "Content Strategy", "Posting Frequency", "Content Mix",
                      "Top Performing Posts", "Audience Tactics", "Hook Patterns", "Virality Potential"
                    ].map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                        <span style={{ color: "#22c55e", fontSize: 12 }}>✓</span>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data source notice */}
                {results.dataSource === "estimated" && (
                  <div style={{ padding: 14, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'DM Sans', sans-serif" }}>
                      Estimates only — connect this platform for real data
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ════ POSTS TAB ════ */}
            {activeTab === "posts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>
                    TOP PERFORMING CONTENT · {results.outliers.length} POSTS
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {results.outliers.map((_, i) => (
                      <button key={i} onClick={() => setActiveOutlier(i)} style={{
                        padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                        background: activeOutlier === i ? "rgba(6,182,212,0.12)" : "#060810",
                        border: `1px solid ${activeOutlier === i ? "rgba(6,182,212,0.4)" : "#1e2535"}`,
                        color: activeOutlier === i ? "#06b6d4" : "#64748b",
                        fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600,
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
                        <div style={{ fontSize: 17, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{post.title}</div>
                        <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 16, fontStyle: "italic", borderLeft: "3px solid #1e2535", paddingLeft: 12 }}>
                          &ldquo;{post.hook}&rdquo;
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                          {[
                            { label: "LIKES", val: post.likes?.toLocaleString(), icon: "❤️", color: "#ef4444" },
                            { label: "COMMENTS", val: post.comments?.toLocaleString(), icon: "💬", color: "#3b82f6" },
                            { label: "SHARES", val: post.shares?.toLocaleString(), icon: "🔁", color: "#8b5cf6" },
                            { label: "ENG. RATE", val: post.engagementRate, icon: "📈", color: "#22c55e" },
                          ].map(({ label, val, icon, color }) => (
                            <div key={label} style={{ background: "#060810", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
                              <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{icon} {label}</div>
                              <div style={{ fontSize: 18, color: "#e2e8f0", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {/* Why it worked */}
                        <div style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: 12, padding: 16 }}>
                          <div style={{ fontSize: 11, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>💡 WHY IT WORKED</div>
                          <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>{post.whyItWorked}</div>
                          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                              ⚡ {post.keyTactic}
                            </span>
                            <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#0d1017", border: "1px solid #1e2535", color: "#94a3b8", textTransform: "capitalize" }}>
                              📷 {post.contentType}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ════ IDEAS TAB ════ */}
            {activeTab === "ideas" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, padding: "0 4px" }}>
                  AI-GENERATED IDEAS · {results.contentIdeas?.length}
                </div>
                {results.contentIdeas?.map((idea, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18,
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2d3748"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e2535"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{idea.title}</div>
                        <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>{idea.angle}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => saveIdea(idea)} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #1e2535", color: "#4a5568", fontSize: 11, fontFamily: "'DM Mono', monospace", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#4a5568"; e.currentTarget.style.color = "#94a3b8"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2535"; e.currentTarget.style.color = "#4a5568"; }}
                        >SAVE</button>
                        <button onClick={() => useIdea(idea)} style={{ padding: "6px 14px", borderRadius: 6, cursor: "pointer", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.1)"; }}
                        >USE →</button>
                      </div>
                    </div>
                    {idea.hook && (
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 10, fontStyle: "italic", borderLeft: "2px solid #1e2535", paddingLeft: 10 }}>
                        &ldquo;{idea.hook}&rdquo;
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <ViralityMeter score={idea.viralityScore} />
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600,
                        background: idea.predictedEngagement === "viral" ? "rgba(34,197,94,0.1)" : idea.predictedEngagement === "high" ? "rgba(6,182,212,0.1)" : "rgba(245,158,11,0.1)",
                        border: `1px solid ${idea.predictedEngagement === "viral" ? "rgba(34,197,94,0.3)" : idea.predictedEngagement === "high" ? "rgba(6,182,212,0.3)" : "rgba(245,158,11,0.3)"}`,
                        color: idea.predictedEngagement === "viral" ? "#22c55e" : idea.predictedEngagement === "high" ? "#06b6d4" : "#f59e0b",
                      }}>
                        {idea.predictedEngagement?.toUpperCase()}
                      </span>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace",
                        background: "#060810", border: "1px solid #1e2535", color: "#64748b", textTransform: "capitalize",
                      }}>
                        {idea.postType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
