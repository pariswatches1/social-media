"use client";

interface Props {
  used: number;
  limit: number;
  plan: string;
}

export default function UsageBadge({ used, limit, plan }: Props) {
  const isUnlimited = plan === "PRO" || plan === "AGENCY";
  const pct = isUnlimited || limit === 0 ? 0 : (used / limit) * 100;
  const isNearLimit = !isUnlimited && pct >= 66;
  const isAtLimit = !isUnlimited && used >= limit;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 14px",
        background: isAtLimit ? "rgba(239,68,68,0.1)" : "rgba(6,182,212,0.05)",
        border: `1px solid ${isAtLimit ? "rgba(239,68,68,0.3)" : "rgba(6,182,212,0.15)"}`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isAtLimit ? "#ef4444" : isNearLimit ? "#f59e0b" : "#22c55e",
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          color: isAtLimit ? "#ef4444" : "#94a3b8",
        }}
      >
        {isUnlimited ? "UNLIMITED" : `${used}/${limit} ANALYSES`}
      </span>
      <span
        className="tag-chip"
        style={{
          background: "rgba(6,182,212,0.1)",
          border: "1px solid rgba(6,182,212,0.3)",
          color: "#06b6d4",
          fontSize: 10,
          padding: "1px 8px",
        }}
      >
        {plan}
      </span>
    </div>
  );
}
