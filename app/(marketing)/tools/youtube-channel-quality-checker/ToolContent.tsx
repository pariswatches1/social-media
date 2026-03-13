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
        body: JSON.stringify({ tool: "youtube-channel-quality-checker", handle }),
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <ToolLayout
      badge="YouTube Tool"
      title="YouTube Channel Quality Checker"
      subtitle="Check the quality of any YouTube channel. AI analyzes content, engagement, and growth potential."
      platform="youtube"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={run}
        placeholder="Enter YouTube channel name"
        loading={loading}
        buttonText="Check Quality"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Quality Score Hero */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 28, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Quality Score</div>
              <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getScoreColor(result.qualityScore) }}>
                {result.qualityScore}<span style={{ fontSize: 24, color: "#4a5568" }}>/100</span>
              </div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: `${getScoreColor(result.qualityScore)}18`, color: getScoreColor(result.qualityScore), border: `1px solid ${getScoreColor(result.qualityScore)}40` }}>
                {getScoreLabel(result.qualityScore)}
              </span>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Subscribers", value: result.estimatedSubscribers },
                { label: "Total Views", value: result.estimatedTotalViews },
                { label: "Upload Frequency", value: result.uploadFrequency },
                { label: "Growth", value: result.growthTrajectory?.split(" ")[0] || "—" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Content Quality */}
            {result.contentQualityAssessment && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Content Quality</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2e8f0", margin: 0, lineHeight: 1.6 }}>{result.contentQualityAssessment}</p>
              </div>
            )}

            {/* Engagement Level */}
            {result.audienceEngagementLevel && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Audience Engagement</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2e8f0", margin: 0, lineHeight: 1.6 }}>{result.audienceEngagementLevel}</p>
              </div>
            )}

            {/* Improvements */}
            {result.improvements && result.improvements.length > 0 && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Recommendations</div>
                {result.improvements.map((item: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#FF0000" }}>{i + 1}.</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2e8f0" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* YouTube API Note */}
            <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#06b6d4", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              YouTube API integration coming soon for real-time data. Current results are AI-powered estimates based on publicly available knowledge.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
