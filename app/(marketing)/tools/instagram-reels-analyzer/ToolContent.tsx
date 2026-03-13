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
        body: JSON.stringify({ tool: "instagram-reels-analyzer", handle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const ra = data.data?.reelsAnalysis;
      setResult({
        success: data.success,
        dataSource: data.dataSource,
        reelsCount: ra?.reelsCount ?? data.data?.reelsCount,
        reelsPercentage: ra?.reelsPercentage ? parseFloat(ra.reelsPercentage) : undefined,
        avgPlayCount: ra?.avgPlayCount,
        reelsEngagement: ra?.avgReelEngagementRate ? parseFloat(ra.avgReelEngagementRate) : undefined,
        overallEngagement: ra?.overallEngagementRate ? parseFloat(ra.overallEngagementRate) : undefined,
        topReels: ra?.top3ReelsByEngagement?.map((r: any) => ({
          caption: r.caption,
          date: r.date,
          plays: r.playCount,
          likes: r.likes,
          comments: r.comments,
        })),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      badge="FREE INSTAGRAM TOOL"
      title="Instagram Reels Analyzer"
      subtitle="Analyze Instagram Reels performance. Check engagement rates, play counts, and discover which Reels perform best."
      platform="instagram"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={analyze}
        placeholder="Enter Instagram handle"
        loading={loading}
        buttonText="Analyze Reels"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Reels Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Reels Count</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{result.reelsCount ?? "—"}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>% of Total</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>{result.reelsPercentage?.toFixed(1) ?? "—"}%</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Avg Plays</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#22c55e" }}>{result.avgPlayCount?.toLocaleString() ?? "—"}</div>
              </div>
            </div>

            {/* Engagement Comparison */}
            <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Engagement: Reels vs Overall</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Reels Engagement</div>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>{result.reelsEngagement?.toFixed(2) ?? "—"}%</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.15)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#0a1e5e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Overall Engagement</div>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#0a1e5e" }}>{result.overallEngagement?.toFixed(2) ?? "—"}%</div>
                </div>
              </div>
              {result.reelsEngagement != null && result.overallEngagement != null && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: result.reelsEngagement > result.overallEngagement ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)", border: `1px solid ${result.reelsEngagement > result.overallEngagement ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)"}`, textAlign: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: result.reelsEngagement > result.overallEngagement ? "#22c55e" : "#f59e0b" }}>
                    Reels {result.reelsEngagement > result.overallEngagement ? "outperform" : "underperform"} overall content by {Math.abs(result.reelsEngagement - result.overallEngagement).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            {/* Top Reels */}
            {result.topReels && result.topReels.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Top 3 Reels</div>
                {result.topReels.slice(0, 3).map((reel: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.3)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", fontSize: 14, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>#{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", marginBottom: 2 }}>{reel.caption || "Reel"}</div>
                        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)" }}>{reel.date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{reel.plays?.toLocaleString()} plays</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#22c55e" }}>{reel.likes?.toLocaleString()} likes</span>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4" }}>{reel.comments?.toLocaleString()} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
