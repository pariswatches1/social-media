"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

interface Channel {
  channelName: string;
  handle?: string;
  estimatedSubscribers: string;
  language?: string;
  contentFocus: string;
  locationRelevance?: string;
  audienceRegion?: string;
  notableFor?: string;
}

export default function ToolContent() {
  const [location, setLocation] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = location.trim() && !loading;

  const run = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "youtube-search-by-location", location, niche }),
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
    border: "1px solid rgba(10,30,94,0.12)",
    background: "rgba(255,255,255,0.9)",
    color: "#1a1a2e",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    minWidth: 0,
  };

  return (
    <ToolLayout
      badge="YouTube Discovery"
      title="Find YouTube Influencers by Location"
      subtitle="Discover YouTube creators in any region. Find local influencers for your marketing campaigns."
      platform="youtube"
    >
      <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 24 }}>
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
              background: canSubmit ? "#0a1e5e" : "rgba(10,30,94,0.15)",
              color: canSubmit ? "#0a1e5e" : "rgba(10,30,94,0.4)",
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
        {result?.success && result.channels && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Regional Insights */}
            {result.regionalInsights && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
                <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Dominant Language</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{result.regionalInsights.dominantLanguage}</div>
                </div>
                <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Popular Categories</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {result.regionalInsights.popularCategories?.map((cat: string, i: number) => (
                      <span key={i} style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", padding: "2px 8px", borderRadius: 8, background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", color: "#0a1e5e" }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Market Notes */}
            {result.regionalInsights?.marketNotes && (
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16, marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Market Notes</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: 0, lineHeight: 1.5 }}>{result.regionalInsights.marketNotes}</p>
              </div>
            )}

            {/* Channel Cards */}
            {result.channels.map((ch: Channel, i: number) => (
              <div
                key={i}
                style={{
                  background: "rgba(10,30,94,0.1)",
                  border: "1px solid rgba(10,30,94,0.12)",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  alignItems: "flex-start",
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#0a1e5e" }}>
                      {ch.channelName}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#0a1e5e", letterSpacing: 1 }}>
                      {ch.estimatedSubscribers} subs
                    </span>
                    {ch.language && (
                      <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "2px 8px", borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#0a1e5e" }}>
                        {ch.language}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: "0 0 4px" }}>
                    {ch.contentFocus}
                  </p>
                  {ch.notableFor && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(10,30,94,0.65)", margin: 0, fontStyle: "italic" }}>
                      Notable for: {ch.notableFor}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div style={{ marginTop: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#92400e", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              These results are AI-generated estimates. Channel names, subscriber counts, locations, and content details should be verified on YouTube before outreach.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
