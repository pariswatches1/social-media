"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

interface Idea {
  title: string;
  hook: string;
  postType: string;
  angle: string;
}

export default function ToolContent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "ai-content-ideas-generator", topic: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const postTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("reel") || t.includes("video")) return "#E1306C";
    if (t.includes("carousel")) return "#06b6d4";
    if (t.includes("story")) return "#fbbf24";
    return "#22c55e";
  };

  return (
    <ToolLayout
      badge="AI Content Tool"
      title="AI Content Ideas Generator"
      subtitle="Enter your niche and get 10 creative post ideas with hooks, angles, and formats — powered by AI."
      platform="instagram"
    >
      <ToolInput
        value={input}
        onChange={setInput}
        onSubmit={run}
        placeholder="Enter your niche (e.g., fitness, travel, food)"
        loading={loading}
        buttonText="Generate Ideas"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.ideas && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.ideas.map((idea: Idea, i: number) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(10,30,94,0.12)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.3)",
                      lineHeight: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 12,
                      fontSize: 10,
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: 1,
                      background: `${postTypeColor(idea.postType)}15`,
                      border: `1px solid ${postTypeColor(idea.postType)}40`,
                      color: postTypeColor(idea.postType),
                      textTransform: "uppercase",
                    }}
                  >
                    {idea.postType}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: "0 0 6px",
                  }}
                >
                  {idea.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "#0a1e5e",
                    fontStyle: "italic",
                    margin: "0 0 8px",
                  }}
                >
                  &ldquo;{idea.hook}&rdquo;
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "rgba(10,30,94,0.65)",
                    margin: 0,
                  }}
                >
                  {idea.angle}
                </p>
              </div>
            ))}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
