"use client";

interface ToolResultsProps {
  loading: boolean;
  error: string | null;
  dataSource?: "real" | "ai_estimate";
  children: React.ReactNode;
}

export default function ToolResults({ loading, error, dataSource, children }: ToolResultsProps) {
  if (loading) {
    return (
      <div style={{ marginTop: 20 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10, marginBottom: 12, background: "#0a0d14", border: "1px solid #1e2535" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      {dataSource && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "3px 10px", borderRadius: 12, background: dataSource === "real" ? "rgba(34,197,94,0.1)" : "rgba(6,182,212,0.1)", border: `1px solid ${dataSource === "real" ? "rgba(34,197,94,0.3)" : "rgba(6,182,212,0.3)"}`, color: dataSource === "real" ? "#22c55e" : "#06b6d4", letterSpacing: 1 }}>
            {dataSource === "real" ? "REAL DATA" : "AI-POWERED"}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
