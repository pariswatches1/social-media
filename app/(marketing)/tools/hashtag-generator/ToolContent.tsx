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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      // Transform API response into sections format
      const d = json.data || {};
      const h = d.hashtags || {};
      const sections: HashtagSection[] = [];
      if (h.popular?.length) sections.push({ category: "Popular", hashtags: h.popular.map((t: any) => typeof t === "string" ? t : t.tag) });
      if (h.niche?.length) sections.push({ category: "Niche", hashtags: h.niche.map((t: any) => typeof t === "string" ? t : t.tag) });
      if (h.brandedUnique?.length) sections.push({ category: "Branded/Unique", hashtags: h.brandedUnique.map((t: any) => typeof t === "string" ? t : t.tag) });
      setResult({ ...json, sections, tips: d.usageTips || [] });
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
    Popular: "#7c2d54",
    Niche: "#0a1e5e",
    "Branded/Unique": "#166534",
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
                  border: "1px solid rgba(10,30,94,0.12)",
                  background: copied === "ALL" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.15)",
                  color: copied === "ALL" ? "#166534" : "rgba(10,30,94,0.7)",
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
              const color = sectionColors[section.category] || "#0a1e5e";
              return (
                <div key={si}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "rgba(10,30,94,0.5)",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {section.category}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(10,30,94,0.08)" }} />
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
                            color: isCopied ? "#166534" : "#0a1e5e",
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
