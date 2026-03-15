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
      const res = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "tiktok-engagement-calculator", username: input }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const getRatingColor = (r: string) => {
    const l = r?.toLowerCase();
    if (l === "excellent") return "#166534";
    if (l === "good") return "#1e40af";
    if (l === "average") return "#b45309";
    return "#991b1b";
  };

  return (
    <ToolLayout
      badge="TikTok Analytics"
      title="TikTok Engagement Rate Calculator"
      subtitle="Calculate real engagement rates for any TikTok creator — likes, comments, shares, and views analyzed by AI."
      platform="tiktok"
      faq={[
        { question: "How is TikTok engagement rate different from Instagram?", answer: "TikTok engagement includes views, likes, comments, and shares. Because TikTok's algorithm shows content to non-followers, engagement rates are often calculated based on views rather than just followers, making them naturally higher." },
        { question: "What is a good TikTok engagement rate?", answer: "TikTok generally has higher engagement rates than other platforms. 4-8% is average, 8-15% is good, and above 15% is excellent. Smaller accounts often see higher rates due to TikTok's discovery algorithm." },
        { question: "Is this tool free?", answer: "Yes, completely free! No signup needed. You get 5 free analyses per day to evaluate TikTok creators." },
        { question: "How accurate are the results?", answer: "Results are AI-powered estimates based on publicly available data and platform benchmarks. For exact metrics, check TikTok's native analytics." }
      ]}
    >
      <ToolInput value={input} onChange={setInput} onSubmit={run} placeholder="Enter TikTok username (e.g., charlidamelio)" loading={loading} buttonText="Calculate" />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Engagement Rate Hero */}
            <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Engagement Rate</div>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getRatingColor(result.rating) }}>{result.engagementRate}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
                <span style={{ padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: `${getRatingColor(result.rating)}15`, color: getRatingColor(result.rating), border: `1px solid ${getRatingColor(result.rating)}30` }}>{result.rating}</span>
                {result.estimatedFollowers && <span style={{ padding: "5px 16px", borderRadius: 20, fontSize: 12, fontFamily: "'DM Mono', monospace", background: "rgba(10,30,94,0.08)", color: "#0a1e5e" }}>{result.estimatedFollowers} followers</span>}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Avg Likes", value: result.averageLikes, icon: "♥" },
                { label: "Avg Comments", value: result.averageComments, icon: "💬" },
                { label: "Avg Shares", value: result.averageShares, icon: "↗" },
                { label: "Avg Views", value: result.averageViews, icon: "👁" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{s.value || "—"}</div>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Benchmarks */}
            {result.benchmarks && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>vs Niche Avg</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{result.benchmarks.vsNiche}</div>
                </div>
                <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>vs Platform Avg</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{result.benchmarks.vsPlatform}</div>
                </div>
              </div>
            )}

            {/* Content Breakdown */}
            {result.contentBreakdown?.length > 0 && (
              <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Content Breakdown</div>
                {result.contentBreakdown.map((item: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < result.contentBreakdown.length - 1 ? "1px solid rgba(10,30,94,0.08)" : "none" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", flex: 1 }}>{item.type}</span>
                    <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(10,30,94,0.1)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #1e40af, #1d4ed8)", width: `${item.percentage}%` }} />
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#0a1e5e", minWidth: 36, textAlign: "right" }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
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
