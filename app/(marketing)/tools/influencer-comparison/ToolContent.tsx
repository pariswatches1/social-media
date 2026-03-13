"use client";
import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [handle, setHandle] = useState("");
  const [handle2, setHandle2] = useState("");
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
        body: JSON.stringify({ tool: "influencer-comparison", handle, handle2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = handle.trim() && handle2.trim() && !loading;

  const getWinnerStyle = (winner: number, side: number) => {
    if (winner === side) return { color: "#22c55e", fontWeight: 800 as const };
    return { color: "#94a3b8", fontWeight: 400 as const };
  };

  return (
    <ToolLayout
      badge="FREE INSTAGRAM TOOL"
      title="Influencer Comparison Tool"
      subtitle="Compare two Instagram accounts side by side. See who wins on followers, engagement, and content performance."
      platform="instagram"
    >
      {/* Custom dual input */}
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && analyze()}
            placeholder="@handle1"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 8, border: "1px solid #1e2535", background: "#060810", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
          />
          <span style={{ color: "#4a5568", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>VS</span>
          <input
            type="text"
            value={handle2}
            onChange={(e) => setHandle2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && analyze()}
            placeholder="@handle2"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 8, border: "1px solid #1e2535", background: "#060810", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
          />
          <button
            onClick={analyze}
            disabled={!canSubmit}
            style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: canSubmit ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#1e2535", color: canSubmit ? "#fff" : "#4a5568", fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", letterSpacing: 0.5, whiteSpace: "nowrap" }}
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </div>

      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.account1 && result.account2 && (
          <div>
            {/* Header row with names */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr", gap: 0, marginBottom: 16 }}>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: "12px 0 0 12px", padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>@{result.account1.handle}</div>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginTop: 4 }}>{result.account1.followers?.toLocaleString()} followers</div>
              </div>
              <div style={{ background: "#0a0d14", borderTop: "1px solid #1e2535", borderBottom: "1px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#4a5568" }}>VS</span>
              </div>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: "0 12px 12px 0", padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#E1306C" }}>@{result.account2.handle}</div>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginTop: 4 }}>{result.account2.followers?.toLocaleString()} followers</div>
              </div>
            </div>

            {/* Metric Comparison Rows */}
            {result.comparisons && result.comparisons.map((row: any, i: number) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px 1fr", gap: 0, marginBottom: 2 }}>
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: i === 0 ? "12px 0 0 0" : i === result.comparisons.length - 1 ? "0 0 0 12px" : 0, padding: "14px 18px", textAlign: "right" }}>
                  <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", ...getWinnerStyle(row.winner, 1) }}>
                    {row.value1}
                  </span>
                  {row.winner === 1 && (
                    <span style={{ marginLeft: 8, fontSize: 9, fontFamily: "'DM Mono', monospace", padding: "2px 6px", borderRadius: 8, background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)", textTransform: "uppercase", letterSpacing: 1 }}>WIN</span>
                  )}
                </div>
                <div style={{ background: "#0a0d14", borderTop: "1px solid #1e2535", borderBottom: "1px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>{row.metric}</span>
                </div>
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: i === 0 ? "0 12px 0 0" : i === result.comparisons.length - 1 ? "0 0 12px 0" : 0, padding: "14px 18px", textAlign: "left" }}>
                  {row.winner === 2 && (
                    <span style={{ marginRight: 8, fontSize: 9, fontFamily: "'DM Mono', monospace", padding: "2px 6px", borderRadius: 8, background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)", textTransform: "uppercase", letterSpacing: 1 }}>WIN</span>
                  )}
                  <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", ...getWinnerStyle(row.winner, 2) }}>
                    {row.value2}
                  </span>
                </div>
              </div>
            ))}

            {/* Overall Winner */}
            {result.overallWinner && (
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: 20, textAlign: "center", marginTop: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#22c55e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Overall Winner</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#22c55e" }}>@{result.overallWinner}</div>
                {result.winnerSummary && (
                  <p style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", margin: "8px 0 0", lineHeight: "20px" }}>{result.winnerSummary}</p>
                )}
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
