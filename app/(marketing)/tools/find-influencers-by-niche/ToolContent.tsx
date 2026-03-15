"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

interface Influencer {
  handle: string;
  estimatedFollowers: string;
  reason: string;
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
        body: JSON.stringify({ tool: "find-influencers-by-niche", niche: input }),
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
      badge="Influencer Discovery"
      title="Find Influencers by Niche"
      subtitle="Enter a keyword and discover the top Instagram creators in any niche — powered by AI."
      platform="instagram"
    >
      <ToolInput
        value={input}
        onChange={setInput}
        onSubmit={run}
        placeholder="Enter a niche (e.g., vegan cooking, street fashion)"
        loading={loading}
        buttonText="Find Influencers"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.influencers && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.influencers.map((inf: Influencer, i: number) => (
              <div
                key={i}
                style={{
                  background: "rgba(10,30,94,0.1)",
                  border: "1px solid rgba(10,30,94,0.12)",
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
                    color: "rgba(10,30,94,0.2)",
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
                        color: "#0a1e5e",
                      }}
                    >
                      @{inf.handle.replace(/^@/, "")}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "#0a1e5e",
                        letterSpacing: 1,
                      }}
                    >
                      {inf.estimatedFollowers} followers
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "rgba(10,30,94,0.65)",
                      margin: 0,
                    }}
                  >
                    {inf.reason}
                  </p>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 8,
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.15)",
                color: "#92400e",
                fontSize: 12,
                padding: 12,
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              These results are AI-generated estimates. Follower counts and relevance may not reflect real-time data. Always verify before outreach.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
