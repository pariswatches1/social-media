"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "tiktok-account-quality-checker", username: input }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const getTierColor = (tier: string) => {
    const t = tier?.toLowerCase();
    if (t?.includes("elite")) return "#166534";
    if (t?.includes("strong")) return "#1e40af";
    if (t?.includes("average")) return "#b45309";
    return "#991b1b";
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "#166534";
    if (score >= 60) return "#1e40af";
    if (score >= 40) return "#b45309";
    return "#991b1b";
  };

  return (
    <ToolLayout badge="TikTok Analytics" title="TikTok Account Quality Checker" subtitle="Get an AI quality score for any TikTok account — analyze content, growth, engagement, and audience authenticity." platform="tiktok">
      <ToolInput value={input} onChange={setInput} onSubmit={run} placeholder="Enter TikTok username" loading={loading} buttonText="Check Quality" />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Score Hero */}
            <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Quality Score</div>
              <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${scoreColor(result.qualityScore)}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: scoreColor(result.qualityScore) }}>{result.qualityScore}</span>
              </div>
              <span style={{ padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: `${getTierColor(result.accountTier)}15`, color: getTierColor(result.accountTier), border: `1px solid ${getTierColor(result.accountTier)}30` }}>{result.accountTier}</span>
            </div>

            {/* Metrics Grid */}
            {result.metrics && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {Object.entries(result.metrics).map(([key, val]) => (
                  <div key={key} style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{key.replace(/([A-Z])/g, " $1").trim()}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{val as string}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths & Improvements */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {result.strengths?.length > 0 && (
                <div style={{ background: "rgba(22,101,52,0.06)", border: "1px solid rgba(22,101,52,0.15)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#166534", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Strengths</div>
                  {result.strengths.map((s: string, i: number) => (
                    <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", padding: "4px 0", display: "flex", gap: 8 }}>
                      <span style={{ color: "#166534" }}>✓</span> {s}
                    </div>
                  ))}
                </div>
              )}
              {result.improvements?.length > 0 && (
                <div style={{ background: "rgba(180,83,9,0.06)", border: "1px solid rgba(180,83,9,0.15)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#b45309", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>To Improve</div>
                  {result.improvements.map((s: string, i: number) => (
                    <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", padding: "4px 0", display: "flex", gap: 8 }}>
                      <span style={{ color: "#b45309" }}>→</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audience Insights */}
            {result.audienceInsights && (
              <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Audience Insights</div>
                {Object.entries(result.audienceInsights).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(10,30,94,0.06)" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(10,30,94,0.6)" }}>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{Array.isArray(val) ? (val as string[]).join(", ") : val as string}</span>
                  </div>
                ))}
              </div>
            )}

            {result.summary && (
              <div style={{ background: "rgba(10,30,94,0.05)", border: "1px solid rgba(10,30,94,0.1)", borderRadius: 12, padding: 18 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: 0, lineHeight: 1.7 }}>{result.summary}</p>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
