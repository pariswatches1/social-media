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
      const res = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "tiktok-fake-follower-checker", username: input }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const riskColor = (level: string) => {
    const l = level?.toLowerCase();
    if (l === "low") return "#166534";
    if (l === "medium") return "#b45309";
    if (l === "high") return "#dc2626";
    return "#991b1b";
  };

  return (
    <ToolLayout badge="TikTok Analytics" title="TikTok Fake Follower Checker" subtitle="Detect fake followers and bots on any TikTok account — AI-powered authenticity analysis." platform="tiktok"
      faq={[
        { question: "How does the fake follower checker work?", answer: "Our AI analyzes follower patterns, engagement-to-follower ratios, account age distribution, and suspicious activity indicators to estimate the percentage of fake or bot followers." },
        { question: "What counts as a fake follower on TikTok?", answer: "Fake followers include bot accounts, purchased followers, inactive accounts, and mass-follow/unfollow accounts. TikTok's algorithm makes it harder to fake engagement, but follower counts can still be inflated." },
        { question: "Can I check any account?", answer: "You can check any public TikTok account. Private accounts cannot be analyzed." }
      ]}
    >
      <ToolInput value={input} onChange={setInput} onSubmit={run} placeholder="Enter TikTok username" loading={loading} buttonText="Check Authenticity" />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Authenticity Score */}
            <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Authenticity Score</div>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: riskColor(result.riskLevel === "Low" ? "low" : result.riskLevel) }}>{result.authenticityScore}<span style={{ fontSize: 20 }}>/100</span></div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${riskColor(result.riskLevel)}15`, color: riskColor(result.riskLevel), border: `1px solid ${riskColor(result.riskLevel)}30` }}>{result.riskLevel} Risk</span>
            </div>

            {/* Follower Breakdown Bar */}
            {result.followerBreakdown && (
              <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Follower Breakdown</div>
                <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 28, marginBottom: 12 }}>
                  <div style={{ width: `${result.followerBreakdown.real}%`, background: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{result.followerBreakdown.real}%</span>
                  </div>
                  <div style={{ width: `${result.followerBreakdown.suspicious}%`, background: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{result.followerBreakdown.suspicious}%</span>
                  </div>
                  <div style={{ width: `${result.followerBreakdown.inactive}%`, background: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{result.followerBreakdown.inactive}%</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                  {[{ label: "Real", color: "#166534" }, { label: "Suspicious", color: "#b45309" }, { label: "Inactive", color: "#6b7280" }].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                      <span style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#0a1e5e" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags & Positive Signals */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {result.redFlags?.length > 0 && (
                <div style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#991b1b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Red Flags</div>
                  {result.redFlags.map((f: string, i: number) => (
                    <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", padding: "4px 0", display: "flex", gap: 8 }}>
                      <span style={{ color: "#dc2626" }}>⚠</span> {f}
                    </div>
                  ))}
                </div>
              )}
              {result.positiveSignals?.length > 0 && (
                <div style={{ background: "rgba(22,101,52,0.05)", border: "1px solid rgba(22,101,52,0.15)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#166534", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Positive Signals</div>
                  {result.positiveSignals.map((s: string, i: number) => (
                    <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", padding: "4px 0", display: "flex", gap: 8 }}>
                      <span style={{ color: "#166534" }}>✓</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendation */}
            {result.recommendation && (
              <div style={{ background: "rgba(10,30,94,0.05)", border: "1px solid rgba(10,30,94,0.1)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Recommendation</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: 0, lineHeight: 1.7 }}>{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
