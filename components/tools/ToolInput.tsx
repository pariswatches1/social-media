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
    <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.15)", borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" }}>
      {label && <label style={{ display: "block", fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.6)", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>{label}</label>}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && value.trim() && onSubmit()}
          placeholder={placeholder}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(10,30,94,0.15)", background: "rgba(255,255,255,0.9)", color: "#0a1e5e", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
        />
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: loading || !value.trim() ? "rgba(10,30,94,0.15)" : "#0a1e5e", color: loading || !value.trim() ? "rgba(10,30,94,0.4)" : "#fff", fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: loading || !value.trim() ? "not-allowed" : "pointer", letterSpacing: 0.5, whiteSpace: "nowrap" }}
        >
          {loading ? "Analyzing..." : buttonText}
        </button>
      </div>
    </div>
  );
}
