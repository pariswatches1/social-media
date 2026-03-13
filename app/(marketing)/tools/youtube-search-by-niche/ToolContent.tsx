"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

interface Channel {
  channelName: string;
  handle?: string;
  estimatedSubscribers: string;
  contentStyle: string;
  uploadFrequency?: string;
  averageViews?: string;
  audienceType?: string;
  standoutContent?: string;
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
        body: JSON.stringify({ tool: "youtube-search-by-niche", niche: input }),
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
      badge="YouTube Discovery"
      title="Find YouTube Influencers by Niche"
      subtitle="Discover YouTube creators in any niche. AI-powered search to find relevant channels for partnerships."
      platform="youtube"
    >
      <ToolInput
        value={input}
        onChange={setInput}
        onSubmit={run}
        placeholder="Enter a niche (e.g., tech reviews, cooking)"
        loading={loading}
        buttonText="Find Channels"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.channels && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Niche Insights */}
            {result.nicheInsights && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 4 }}>
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Saturation</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#e2e8f0", textTransform: "capitalize" }}>{result.nicheInsights.saturation}</div>
                </div>
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Trend</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#e2e8f0", textTransform: "capitalize" }}>{result.nicheInsights.growthTrend}</div>
                </div>
                <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Top Format</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{result.nicheInsights.topContentFormats?.[0] || "—"}</div>
                </div>
              </div>
            )}

            {/* Channel Cards */}
            {result.channels.map((ch: Channel, i: number) => (
              <div
                key={i}
                style={{
                  background: "#0a0d14",
                  border: "1px solid #1e2535",
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
                    color: "#1e2535",
                    lineHeight: 1,
                    minWidth: 36,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                      {ch.channelName}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#FF0000", letterSpacing: 1 }}>
                      {ch.estimatedSubscribers} subs
                    </span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8", margin: "0 0 6px" }}>
                    {ch.contentStyle}
                  </p>
                  {ch.uploadFrequency && (
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
                      Uploads: {ch.uploadFrequency}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div style={{ marginTop: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              These results are AI-generated estimates. Channel names, subscriber counts, and content details should be verified on YouTube before outreach.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
