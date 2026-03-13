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
          <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10, marginBottom: 12, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.1)" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#991b1b", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      {dataSource && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "3px 10px", borderRadius: 12, background: "rgba(255,255,255,0.25)", border: "1px solid rgba(10,30,94,0.15)", color: "#0a1e5e", letterSpacing: 1 }}>
            {dataSource === "real" ? "REAL DATA" : "AI-POWERED"}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
