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

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "youtube-engagement-calculator", handle }),
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

  const getRatingColor = (rating: string) => {
    const r = rating?.toLowerCase();
    if (r === "excellent") return "#22c55e";
    if (r === "good") return "#f59e0b";
    if (r === "average") return "#f97316";
    return "#ef4444";
  };

  return (
    <ToolLayout
      badge="YouTube Tool"
      title="YouTube Engagement Rate Calculator"
      subtitle="Calculate the engagement rate of any YouTube channel. Get estimated views, likes, and comments analysis."
      platform="youtube"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={run}
        placeholder="Enter YouTube channel name"
        loading={loading}
        buttonText="Calculate"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Engagement Rate Hero */}
            <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 28, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Engagement Rate</div>
              <div style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getRatingColor(result.engagementRating) }}>
                {result.engagementRate}
              </div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: `${getRatingColor(result.engagementRating)}18`, color: getRatingColor(result.engagementRating), border: `1px solid ${getRatingColor(result.engagementRating)}40` }}>
                {result.engagementRating}
              </span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Avg Views", value: result.averageViewsPerVideo },
                { label: "Avg Likes", value: result.averageLikesPerVideo },
                { label: "Avg Comments", value: result.averageCommentsPerVideo },
                { label: "View-to-Sub Ratio", value: result.viewToSubscriberRatio },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Engagement Breakdown */}
            {result.engagementBreakdown && (
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Engagement Breakdown</div>
                {[
                  { label: "Likes Score", value: `${result.engagementBreakdown.likesScore}/10` },
                  { label: "Comments Score", value: `${result.engagementBreakdown.commentsScore}/10` },
                  { label: "Shares Estimate", value: result.engagementBreakdown.sharesEstimate },
                  { label: "Community Interaction", value: result.engagementBreakdown.communityInteraction },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e" }}>{item.label}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {result.summary && (
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a2e", margin: 0, lineHeight: 1.6 }}>{result.summary}</p>
              </div>
            )}

            {/* YouTube API Note */}
            <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#06b6d4", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              YouTube API integration coming soon for real-time data. Current results are AI-powered estimates.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
