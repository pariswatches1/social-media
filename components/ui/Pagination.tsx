"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: `1px solid ${disabled ? "#1e2535" : "#2d3748"}`,
    background: disabled ? "transparent" : "#0a0d14",
    color: disabled ? "#2d3748" : "#94a3b8",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
      <button style={btnStyle(page <= 1)} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← PREV
      </button>
      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1 }}>
        PAGE {page} OF {totalPages}
      </span>
      <button style={btnStyle(page >= totalPages)} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        NEXT →
      </button>
    </div>
  );
}
