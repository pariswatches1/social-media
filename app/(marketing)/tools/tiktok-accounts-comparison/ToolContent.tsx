"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [handle1, setHandle1] = useState("");
  const [handle2, setHandle2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = handle1 && handle2 && !loading;

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "tiktok-accounts-comparison", handle1, handle2 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const inputStyle = { flex: 1, padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(10,30,94,0.12)", background: "rgba(255,255,255,0.9)", color: "#1a1a2e", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" };

  return (
    <ToolLayout badge="TikTok Comparison" title="Compare TikTok Accounts" subtitle="Compare two TikTok creators side by side — engagement, growth, audience quality, and content analyzed by AI." platform="tiktok">
      {/* Custom dual input */}
      <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
          <input value={handle1} onChange={e => setHandle1(e.target.value)} placeholder="@first_creator" style={inputStyle} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#0a1e5e", fontSize: 14 }}>VS</span>
          <input value={handle2} onChange={e => setHandle2(e.target.value)} placeholder="@second_creator" style={inputStyle} />
        </div>
        <button onClick={run} disabled={!canSubmit} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: canSubmit ? "#0a1e5e" : "rgba(10,30,94,0.15)", color: canSubmit ? "#fff" : "rgba(10,30,94,0.4)", fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed" }}>
          {loading ? "Comparing..." : "Compare Accounts"}
        </button>
      </div>

      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Winner Banner */}
            {result.overallWinner && (
              <div style={{ background: "rgba(22,101,52,0.08)", border: "1px solid rgba(22,101,52,0.2)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                <span style={{ fontSize: 20, marginRight: 8 }}>👑</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#166534" }}>@{result.overallWinner} wins overall</span>
                {result.winnerReason && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(10,30,94,0.6)", margin: "6px 0 0" }}>{result.winnerReason}</p>}
              </div>
            )}

            {/* Side by Side Cards */}
            {result.account1 && result.account2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[result.account1, result.account2].map((acc, idx) => {
                  const isWinner = acc.username?.replace("@", "") === result.overallWinner?.replace("@", "");
                  return (
                    <div key={idx} style={{ background: "rgba(10,30,94,0.08)", border: `2px solid ${isWinner ? "#166534" : "rgba(10,30,94,0.12)"}`, borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#0a1e5e" }}>@{acc.username}</span>
                        {isWinner && <span style={{ fontSize: 14 }}>👑</span>}
                      </div>
                      {Object.entries(acc).filter(([k]) => k !== "username").map(([key, val]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(10,30,94,0.06)" }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(10,30,94,0.5)", textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>{val as string}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Comparison Table */}
            {result.comparison?.length > 0 && (
              <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", background: "rgba(10,30,94,0.06)" }}>
                  {["Metric", result.account1?.username || "Account 1", result.account2?.username || "Account 2", "Winner"].map(h => (
                    <div key={h} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>@{h}</div>
                  ))}
                </div>
                {result.comparison.map((row: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", borderTop: "1px solid rgba(10,30,94,0.06)", alignItems: "center" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", fontWeight: 600 }}>{row.metric}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: row.winner === result.account1?.username ? "#166534" : "#0a1e5e" }}>{row.account1Value}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: row.winner === result.account2?.username ? "#166534" : "#0a1e5e" }}>{row.account2Value}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#166534", fontWeight: 600 }}>@{row.winner}</span>
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
