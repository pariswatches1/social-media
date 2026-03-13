"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

interface Lookalike {
  handle: string;
  estimatedFollowers: string;
  similarityReason: string;
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
        body: JSON.stringify({ tool: "instagram-lookalike-finder", handle: input }),
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

  return (
    <ToolLayout
      badge="Lookalike Finder"
      title="Instagram Lookalike Finder"
      subtitle="Enter any Instagram handle and discover similar creators based on content patterns, audience, and style."
      platform="instagram"
    >
      <ToolInput
        value={input}
        onChange={setInput}
        onSubmit={run}
        placeholder="Enter Instagram handle"
        loading={loading}
        buttonText="Find Lookalikes"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.lookalikes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.lookalikes.map((acc: Lookalike, i: number) => (
              <div
                key={i}
                style={{
                  background: "#0a0d14",
                  border: "1px solid #1e2535",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#1e2535",
                    lineHeight: 1,
                    minWidth: 36,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      @{acc.handle.replace(/^@/, "")}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "#06b6d4",
                        letterSpacing: 1,
                      }}
                    >
                      {acc.estimatedFollowers} followers
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    {acc.similarityReason}
                  </p>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 8,
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.15)",
                color: "#fbbf24",
                fontSize: 12,
                padding: 12,
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              These results are AI-generated estimates based on content pattern analysis. Follower counts and similarity assessments may not reflect real-time data. Always verify before outreach.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
