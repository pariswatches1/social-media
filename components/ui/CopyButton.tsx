"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      style={{
        padding: "6px 14px",
        background: copied ? "rgba(34,197,94,0.15)" : "rgba(6,182,212,0.1)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(6,182,212,0.3)"}`,
        borderRadius: 8,
        cursor: "pointer",
        color: copied ? "#22c55e" : "#06b6d4",
        fontSize: 12,
        fontFamily: "'DM Mono', monospace",
        transition: "all 0.2s",
      }}
    >
      {copied ? "✓ COPIED" : "COPY"}
    </button>
  );
}
