"use client";

interface ToolInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  loading: boolean;
  buttonText?: string;
  label?: string;
}

export default function ToolInput({ value, onChange, onSubmit, placeholder, loading, buttonText = "Analyze", label }: ToolInputProps) {
  return (
    <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>{label}</label>}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && value.trim() && onSubmit()}
          placeholder={placeholder}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 8, border: "1px solid #1e2535", background: "#060810", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
        />
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: loading || !value.trim() ? "#1e2535" : "linear-gradient(135deg, #0891b2, #0e7490)", color: loading || !value.trim() ? "#4a5568" : "#fff", fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: loading || !value.trim() ? "not-allowed" : "pointer", letterSpacing: 0.5, whiteSpace: "nowrap" }}
        >
          {loading ? "Analyzing..." : buttonText}
        </button>
      </div>
    </div>
  );
}
