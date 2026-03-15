"use client";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: "#4a5568",
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: actionLabel ? 20 : 0,
        }}
      >
        {description}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "1px solid rgba(6,182,212,0.3)",
            background: "rgba(6,182,212,0.1)",
            color: "#06b6d4",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 1,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
