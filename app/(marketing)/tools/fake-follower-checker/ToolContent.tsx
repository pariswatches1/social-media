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
    if (level === "Low") return "#166534";
    if (level === "Medium") return "#b45309";
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
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Risk Level</div>
                <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 24, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", background: `${getRiskColor(result.riskLevel)}18`, color: getRiskColor(result.riskLevel), border: `1px solid ${getRiskColor(result.riskLevel)}40` }}>
                  {result.riskLevel}
                </span>
              </div>
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Fraud Score</div>
                <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getRiskColor(result.riskLevel) }}>
                  {result.fraudScore ?? "—"}
                  <span style={{ fontSize: 16, color: "rgba(10,30,94,0.5)" }}>/100</span>
                </div>
              </div>
            </div>

            {/* Red Flags & Green Flags */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Red Flags */}
              {result.redFlags && result.redFlags.length > 0 && (
                <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#ef4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Red Flags</div>
                  {result.redFlags.map((flag: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 800, lineHeight: "20px", fontFamily: "'DM Mono', monospace" }}>!</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", lineHeight: "20px" }}>{flag}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Green Flags */}
              {result.greenFlags && result.greenFlags.length > 0 && (
                <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#166534", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Green Flags</div>
                  {result.greenFlags.map((flag: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: "#166534", fontSize: 14, lineHeight: "20px" }}>+</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", lineHeight: "20px" }}>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Explanation */}
            {result.explanation && (
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#0a1e5e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Detailed Analysis</div>
                <p style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#0a1e5e", lineHeight: "22px", margin: 0 }}>{result.explanation}</p>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
