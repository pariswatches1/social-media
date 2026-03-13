"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

interface Influencer {
  handle: string;
  estimatedFollowers: string;
  reason: string;
}

export default function ToolContent() {
  const [location, setLocation] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "search-influencers-by-location", location, niche }),
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

  const canSubmit = location.trim() && !loading;

  return (
    <ToolLayout
      badge="Influencer Discovery"
      title="Search Influencers by Location"
      subtitle="Find Instagram influencers in any city or country. Discover local creators for partnerships and campaigns."
      platform="instagram"
    >
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            placeholder="City or country"
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
        {result?.success && result.influencers && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.influencers.map((inf: Influencer, i: number) => (
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
                      @{inf.handle.replace(/^@/, "")}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        color: "#06b6d4",
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
                      color: "#64748b",
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
                color: "#fbbf24",
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
