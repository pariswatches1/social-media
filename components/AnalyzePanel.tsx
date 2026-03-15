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

interface SavedIdea {
  title: string;
  angle: string;
  hook: string;
  postType?: string;
  savedAt: string;
}

interface ContentIdea {
  title: string;
  angle: string;
  hook: string;
  predictedEngagement: string;
  postType: string;
  viralityScore: number;
}

interface Outlier {
  title: string;
  hook: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: string;
  whyItWorked: string;
  contentType: string;
  keyTactic: string;
}

interface AnalysisResults {
  error?: string;
  profile: {
    handle: string;
    platform: string;
    niche: string;
    followerEstimate: string;
    avgEngagement: string;
    contentStyle: string;
  };
  outliers: Outlier[];
  contentStrategy: string;
  contentIdeas: ContentIdea[];
}

interface Props {
  savedIdeas: SavedIdea[];
  setSavedIdeas: React.Dispatch<React.SetStateAction<SavedIdea[]>>;
  setCreatePrefill: (prefill: { topic: string; angle: string; hook: string; postType: string }) => void;
}

export default function AnalyzePanel({ savedIdeas, setSavedIdeas, setCreatePrefill }: Props) {
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [activeOutlier, setActiveOutlier] = useState(0);
  const [step, setStep] = useState("");

  const analyze = useCallback(async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setResults(null);
    setActiveOutlier(0);

    const plat = PLATFORMS.find((p) => p.id === platform);
    try {
      setStep("Analyzing profile data...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim(), platform: plat?.label }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

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
      {/* LEFT PANEL */}
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
            style={{ width: "100%", padding: "12px", borderRadius: 10, cursor: loading || !handle.trim() ? "not-allowed" : "pointer", background: loading || !handle.trim() ? "#0d1017" : "linear-gradient(135deg, #0891b2, #0e7490)", border: "none", color: loading ? "#4a5568" : "#000000", fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: 1.5, textShadow: "none", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
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

        {/* SAVED IDEAS */}
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

      {/* RIGHT PANEL */}
      <div style={{ overflowY: "auto", paddingRight: 4 }}>
        {!results && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.4 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🔍</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4a5568", textAlign: "center" }}>
              Enter a handle and run analysis
              <br />
              to see competitor intelligence
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[...Array(3)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        )}

        {results?.error && (
          <div style={{ padding: 20, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{results.error}</div>
        )}

        {results && !results.error && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Profile summary */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>@{results.profile.handle}</div>
                  <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{results.profile.niche}</div>
                </div>
                <span className="tag-chip" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>{results.profile.platform}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "FOLLOWERS", val: results.profile.followerEstimate },
                  { label: "AVG ENG.", val: results.profile.avgEngagement },
                  { label: "STYLE", val: results.profile.contentStyle },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: "#060810", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, borderTop: "1px solid #1e2535", paddingTop: 12 }}>
                {results.contentStrategy}
              </div>
            </div>

            {/* Outlier posts */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>TOP PERFORMING CONTENT · {results.outliers.length} POSTS</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {results.outliers.map((_, i) => (
                  <button key={i} onClick={() => setActiveOutlier(i)} style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", background: activeOutlier === i ? "rgba(6,182,212,0.15)" : "transparent", border: `1px solid ${activeOutlier === i ? "rgba(6,182,212,0.4)" : "#1e2535"}`, color: activeOutlier === i ? "#06b6d4" : "#4a5568", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                    POST {i + 1}
                  </button>
                ))}
              </div>

              {results.outliers[activeOutlier] && (() => {
                const post = results.outliers[activeOutlier];
                return (
                  <div className="fade-in">
                    <div style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{post.title}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 14, fontStyle: "italic" }}>&ldquo;{post.hook}&rdquo;</div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                      {[
                        { label: "❤️ Likes", val: post.likes?.toLocaleString() },
                        { label: "💬 Comments", val: post.comments?.toLocaleString() },
                        { label: "🔁 Shares", val: post.shares?.toLocaleString() },
                        { label: "📈 Eng. Rate", val: post.engagementRate },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ background: "#060810", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                          <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>{label}</div>
                          <div style={{ fontSize: 14, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>WHY IT WORKED</div>
                      <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{post.whyItWorked}</div>
                      <div style={{ marginTop: 8 }}>
                        <span className="tag-chip" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>⚡ {post.keyTactic}</span>
                        <span className="tag-chip" style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#94a3b8", marginLeft: 6 }}>{post.contentType}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Content Ideas */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>AI-GENERATED IDEAS · {results.contentIdeas?.length}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.contentIdeas?.map((idea, i) => (
                  <div
                    key={i}
                    style={{ background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: 16, transition: "border-color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2535")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#e2e8f0", flex: 1, marginRight: 10 }}>{idea.title}</div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => saveIdea(idea)} style={{ padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #1e2535", color: "#4a5568", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>SAVE</button>
                        <button onClick={() => useIdea(idea)} style={{ padding: "4px 12px", borderRadius: 6, cursor: "pointer", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>USE →</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>{idea.angle}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <ViralityMeter score={idea.viralityScore} />
                      </div>
                      <span className="tag-chip" style={{ background: idea.predictedEngagement === "viral" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${idea.predictedEngagement === "viral" ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`, color: idea.predictedEngagement === "viral" ? "#22c55e" : "#f59e0b" }}>
                        {idea.predictedEngagement?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
