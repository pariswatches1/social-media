"use client";
import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "instagram-post-advisor", handle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      badge="FREE INSTAGRAM TOOL"
      title="Instagram Post Advisor"
      subtitle="Get AI-powered recommendations to improve your Instagram content strategy. Analyze any account and get actionable advice."
      platform="instagram"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={analyze}
        placeholder="Enter Instagram handle"
        loading={loading}
        buttonText="Get Advice"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Quick Insights Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Best Posting Times */}
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Best Time</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>{result.bestPostingTime || "N/A"}</div>
              </div>

              {/* Best Content Type */}
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Best Format</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#22c55e" }}>{result.bestContentType || "N/A"}</div>
              </div>

              {/* Caption Style */}
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Caption Style</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#f59e0b" }}>{result.captionStyle || "N/A"}</div>
              </div>
            </div>

            {/* Best Posting Times Detail */}
            {result.bestPostingTimes && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Optimal Posting Schedule</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {result.bestPostingTimes.map((slot: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.1)" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>{slot.time}</span>
                      <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8" }}>{slot.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Cards */}
            {result.recommendations && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase" }}>AI Recommendations</div>
                {result.recommendations.map((rec: any, i: number) => (
                  <div key={i} style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", fontSize: 13, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>{i + 1}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{rec.title}</span>
                      {rec.priority && (
                        <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "2px 8px", borderRadius: 10, background: rec.priority === "high" ? "rgba(239,68,68,0.12)" : rec.priority === "medium" ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)", color: rec.priority === "high" ? "#ef4444" : rec.priority === "medium" ? "#f59e0b" : "#22c55e", border: `1px solid ${rec.priority === "high" ? "rgba(239,68,68,0.3)" : rec.priority === "medium" ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`, textTransform: "uppercase", letterSpacing: 1 }}>{rec.priority}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", lineHeight: "20px", margin: 0 }}>{rec.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Caption Style Analysis */}
            {result.captionAnalysis && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginTop: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Caption Analysis</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 4 }}>AVG LENGTH</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{result.captionAnalysis.avgLength} chars</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 4 }}>AVG HASHTAGS</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{result.captionAnalysis.avgHashtags}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 4 }}>EMOJI USAGE</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{result.captionAnalysis.emojiUsage}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 4 }}>CTA USAGE</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{result.captionAnalysis.ctaUsage}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
