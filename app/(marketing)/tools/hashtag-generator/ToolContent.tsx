"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

interface HashtagSection {
  category: string;
  hashtags: string[];
}

export default function ToolContent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "hashtag-generator", topic: input }),
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

  const copyTag = (tag: string) => {
    const full = `#${tag.replace(/^#/, "")}`;
    navigator.clipboard.writeText(full);
    setCopied(full);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    if (!result?.sections) return;
    const all = result.sections
      .flatMap((s: HashtagSection) => s.hashtags.map((h: string) => `#${h.replace(/^#/, "")}`))
      .join(" ");
    navigator.clipboard.writeText(all);
    setCopied("ALL");
    setTimeout(() => setCopied(null), 1500);
  };

  const sectionColors: Record<string, string> = {
    Popular: "#E1306C",
    Niche: "#06b6d4",
    "Branded/Unique": "#22c55e",
  };

  return (
    <ToolLayout
      badge="Hashtag Tool"
      title="Instagram Hashtag Generator"
      subtitle="Enter a topic or paste your caption and get 30 categorized hashtags — ready to copy and use."
      platform="instagram"
    >
      <ToolInput
        value={input}
        onChange={setInput}
        onSubmit={run}
        placeholder="Enter topic or paste your caption"
        loading={loading}
        buttonText="Generate Hashtags"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.sections && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={copyAll}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "1px solid #1e2535",
                  background: copied === "ALL" ? "rgba(34,197,94,0.15)" : "#0a0d14",
                  color: copied === "ALL" ? "#22c55e" : "#94a3b8",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  letterSpacing: 0.5,
                }}
              >
                {copied === "ALL" ? "Copied!" : "Copy All 30"}
              </button>
            </div>

            {result.sections.map((section: HashtagSection, si: number) => {
              const color = sectionColors[section.category] || "#06b6d4";
              return (
                <div key={si}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "#4a5568",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {section.category}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#1e2535" }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {section.hashtags.map((tag: string, hi: number) => {
                      const full = `#${tag.replace(/^#/, "")}`;
                      const isCopied = copied === full;
                      return (
                        <button
                          key={hi}
                          onClick={() => copyTag(tag)}
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: isCopied ? "rgba(34,197,94,0.15)" : "rgba(6,182,212,0.08)",
                            border: isCopied
                              ? "1px solid rgba(34,197,94,0.4)"
                              : "1px solid rgba(6,182,212,0.2)",
                            color: isCopied ? "#22c55e" : "#06b6d4",
                            fontSize: 13,
                            fontFamily: "'DM Mono', monospace",
                            cursor: "pointer",
                          }}
                        >
                          {isCopied ? "Copied!" : full}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
