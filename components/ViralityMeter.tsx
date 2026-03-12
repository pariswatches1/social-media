"use client";

export default function ViralityMeter({ score }: { score: number }) {
  const colors = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "#1e2535", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: `linear-gradient(90deg, ${colors}aa, ${colors})`,
            borderRadius: 3,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: colors, minWidth: 32 }}>
        {score}%
      </span>
    </div>
  );
}
