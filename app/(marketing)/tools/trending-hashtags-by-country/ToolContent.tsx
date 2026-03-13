"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

interface Hashtag {
  tag: string;
  estimatedPosts: string;
}

interface HashtagSection {
  category: string;
  hashtags: Hashtag[];
}

export default function ToolContent() {
  const [country, setCountry] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    if (!country.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "trending-hashtags-by-country", country, niche }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const d = json.data || {};
      const h = d.hashtags || {};
      const toHashtag = (t: any): Hashtag => typeof t === "string"
        ? { tag: t, estimatedPosts: "" }
        : { tag: t.tag || "", estimatedPosts: t.estimatedPosts || "" };
      const sections: HashtagSection[] = [];
      if (h.highVolume?.length) sections.push({ category: "High Volume", hashtags: h.highVolume.map(toHashtag) });
      if (h.mediumVolume?.length) sections.push({ category: "Medium", hashtags: h.mediumVolume.map(toHashtag) });
      if (h.niche?.length) sections.push({ category: "Niche", hashtags: h.niche.map(toHashtag) });
      setResult({ ...json, sections });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #1e2535",
    background: "#060810",
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    minWidth: 0,
  };

  const canSubmit = country.trim() && !loading;

  const sectionColors: Record<string, string> = {
    "High Volume": "#E1306C",
    Medium: "#06b6d4",
    Niche: "#22c55e",
  };

  return (
    <ToolLayout
      badge="Hashtag Research"
      title="Trending Hashtags by Country"
      subtitle="Discover trending Instagram hashtags in any country. Get 30 categorized hashtags for maximum reach."
      platform="instagram"
    >
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            placeholder="Country (e.g., Brazil, Japan)"
            style={inputStyle}
          />
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            placeholder="Niche (optional)"
            style={inputStyle}
          />
          <button
            onClick={run}
            disabled={!canSubmit}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: canSubmit ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#1e2535",
              color: canSubmit ? "#fff" : "#4a5568",
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.sections && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                    {section.hashtags.map((h: Hashtag, hi: number) => (
                      <div
                        key={hi}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 14px",
                          borderRadius: 20,
                          background: `${color}12`,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontFamily: "'DM Mono', monospace",
                            color,
                          }}
                        >
                          #{h.tag.replace(/^#/, "")}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'DM Mono', monospace",
                            color: "#4a5568",
                          }}
                        >
                          {h.estimatedPosts}
                        </span>
                      </div>
                    ))}
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
