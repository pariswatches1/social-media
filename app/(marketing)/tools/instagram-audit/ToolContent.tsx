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
        body: JSON.stringify({ tool: "instagram-audit", handle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const d = json.data || {};
      const audit = d.audit || {};
      const m = d.metrics || {};
      const metrics = [
        { label: "Engagement Rate", value: m.engagementRate || "—" },
        { label: "Avg Likes", value: m.averageLikesPerPost?.toLocaleString?.() ?? m.averageLikesPerPost ?? "—" },
        { label: "Avg Comments", value: m.averageCommentsPerPost?.toLocaleString?.() ?? m.averageCommentsPerPost ?? "—" },
      ];
      setResult({
        ...json,
        ...d,
        metrics,
        healthScore: audit.healthScore,
        healthLabel: audit.healthLabel,
        strengths: audit.strengths || [],
        weaknesses: audit.weaknesses || [],
        recommendations: audit.recommendations || [],
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <ToolLayout
      badge="FREE INSTAGRAM TOOL"
      title="Instagram Account Audit"
      subtitle="Get a comprehensive health score, engagement analysis, and AI-powered recommendations for any Instagram account."
      platform="instagram"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={analyze}
        placeholder="Enter Instagram handle"
        loading={loading}
        buttonText="Audit"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Health Score */}
            <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Account Health Score</div>
              <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 12px" }}>
                <svg viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="10" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={getScoreColor(result.healthScore)} strokeWidth="10" strokeDasharray={`${(result.healthScore / 100) * 377} 377`} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getScoreColor(result.healthScore) }}>{result.healthScore}</div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)" }}>/100</div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            {result.metrics && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {result.metrics.map((metric: any) => (
                  <div key={metric.label} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{metric.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{metric.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Strengths */}
              {result.strengths && (
                <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#22c55e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Strengths</div>
                  {result.strengths.map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: "#22c55e", fontSize: 14, lineHeight: "20px" }}>+</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", lineHeight: "20px" }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Weaknesses */}
              {result.weaknesses && (
                <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#ef4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Weaknesses</div>
                  {result.weaknesses.map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: "#ef4444", fontSize: 14, lineHeight: "20px" }}>-</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", lineHeight: "20px" }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            {result.recommendations && (
              <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>AI Recommendations</div>
                {result.recommendations.map((rec: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, padding: 12, borderRadius: 8, background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.1)" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4", minWidth: 20 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", lineHeight: "20px" }}>{rec}</span>
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
