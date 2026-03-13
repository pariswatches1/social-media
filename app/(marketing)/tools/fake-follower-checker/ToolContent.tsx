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
        body: JSON.stringify({ tool: "fake-follower-checker", handle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const d = data.data || {};
      setResult({
        ...data,
        ...d,
        riskLevel: d.assessment?.fraudRiskLevel,
        fraudScore: d.assessment?.fraudRiskScore,
        redFlags: d.assessment?.redFlags || [],
        greenFlags: d.assessment?.greenFlags || [],
        explanation: d.assessment?.explanation,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    if (level === "Low") return "#22c55e";
    if (level === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <ToolLayout
      badge="FREE INSTAGRAM TOOL"
      title="Fake Follower Checker"
      subtitle="Check any Instagram account for fake followers. AI-powered fraud detection analyzes engagement patterns and follower quality."
      platform="instagram"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={analyze}
        placeholder="Enter Instagram handle"
        loading={loading}
        buttonText="Check"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Risk Level + Fraud Score */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Risk Level</div>
                <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 24, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", background: `${getRiskColor(result.riskLevel)}18`, color: getRiskColor(result.riskLevel), border: `1px solid ${getRiskColor(result.riskLevel)}40` }}>
                  {result.riskLevel}
                </span>
              </div>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Fraud Score</div>
                <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getRiskColor(result.riskLevel) }}>
                  {result.fraudScore ?? "—"}
                  <span style={{ fontSize: 16, color: "#4a5568" }}>/100</span>
                </div>
              </div>
            </div>

            {/* Red Flags & Green Flags */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Red Flags */}
              {result.redFlags && result.redFlags.length > 0 && (
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#ef4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Red Flags</div>
                  {result.redFlags.map((flag: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 800, lineHeight: "20px", fontFamily: "'DM Mono', monospace" }}>!</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", lineHeight: "20px" }}>{flag}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Green Flags */}
              {result.greenFlags && result.greenFlags.length > 0 && (
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#22c55e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Green Flags</div>
                  {result.greenFlags.map((flag: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: "#22c55e", fontSize: 14, lineHeight: "20px" }}>+</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", lineHeight: "20px" }}>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Explanation */}
            {result.explanation && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Detailed Analysis</div>
                <p style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", lineHeight: "22px", margin: 0 }}>{result.explanation}</p>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
