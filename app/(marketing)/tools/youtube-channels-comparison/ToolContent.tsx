"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [channel1, setChannel1] = useState("");
  const [channel2, setChannel2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = channel1.trim() && channel2.trim() && !loading;

  const run = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "youtube-channels-comparison", handle: channel1, handle2: channel2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid rgba(10,30,94,0.12)",
    background: "rgba(255,255,255,0.9)",
    color: "#1a1a2e",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    minWidth: 0,
  };

  const isWinner = (category: string, channelName: string) => {
    return result?.comparison?.[category] === channelName;
  };

  return (
    <ToolLayout
      badge="YouTube Tool"
      title="YouTube Channels Comparison"
      subtitle="Compare two YouTube channels side by side. See who wins on subscribers, engagement, and content."
      platform="youtube"
    >
      <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="text"
            value={channel1}
            onChange={(e) => setChannel1(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            placeholder="Channel 1"
            style={inputStyle}
          />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: "#0a1e5e", flexShrink: 0 }}>VS</span>
          <input
            type="text"
            value={channel2}
            onChange={(e) => setChannel2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            placeholder="Channel 2"
            style={inputStyle}
          />
          <button
            onClick={run}
            disabled={!canSubmit}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: canSubmit ? "#0a1e5e" : "rgba(10,30,94,0.15)",
              color: canSubmit ? "#0a1e5e" : "rgba(10,30,94,0.4)",
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </div>

      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.channel1 && result.channel2 && (
          <div>
            {/* Two Column Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[result.channel1, result.channel2].map((ch: any, idx: number) => (
                <div key={idx} style={{ background: "rgba(10,30,94,0.1)", border: `1px solid ${result.comparison?.overallWinner === ch.name ? "#991b1b" : "rgba(10,30,94,0.15)"}`, borderRadius: 12, padding: 20 }}>
                  {result.comparison?.overallWinner === ch.name && (
                    <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: 1, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.3)", color: "#0a1e5e", textTransform: "uppercase", marginBottom: 12 }}>
                      WINNER
                    </div>
                  )}
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#0a1e5e", margin: "0 0 14px" }}>{ch.name}</h3>
                  {[
                    { label: "Subscribers", value: ch.estimatedSubscribers, winner: isWinner("subscribersWinner", ch.name) },
                    { label: "Engagement", value: ch.estimatedEngagementRate, winner: isWinner("engagementWinner", ch.name) },
                    { label: "Growth", value: ch.growthTrend, winner: isWinner("growthWinner", ch.name) },
                  ].map((stat) => (
                    <div key={stat.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>{stat.label}</span>
                        {stat.winner && (
                          <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", padding: "1px 6px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#166534" }}>WIN</span>
                        )}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#1a1a2e", marginTop: 4 }}>{stat.value}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>Content Style</span>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: "4px 0 0" }}>{ch.contentStyle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Comparisons */}
            {[
              { label: "Content Style Comparison", value: result.contentStyleComparison },
              { label: "Engagement Comparison", value: result.engagementComparison },
              { label: "Growth Comparison", value: result.growthComparison },
            ].filter((item) => item.value).map((item) => (
              <div key={item.label} style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{item.label}</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a2e", margin: 0, lineHeight: 1.6 }}>{item.value}</p>
              </div>
            ))}

            {/* Summary */}
            {result.summary && (
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a2e", margin: 0, lineHeight: 1.6 }}>{result.summary}</p>
              </div>
            )}

            {/* YouTube API Note */}
            <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#0a1e5e", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              YouTube API integration coming soon for real-time data. Current comparison uses AI-powered estimates.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
