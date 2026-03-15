"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

interface Lookalike {
  channelName: string;
  handle?: string;
  estimatedSubscribers: string;
  contentStyle: string;
  similarityReason: string;
  overlapScore: string;
  uniqueAngle?: string;
}

export default function ToolContent() {
  const [handle, setHandle] = useState("");
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
        body: JSON.stringify({ tool: "youtube-lookalike-finder", handle }),
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

  const getOverlapColor = (score: string) => {
    const s = score?.toLowerCase();
    if (s === "high") return "#166534";
    if (s === "medium") return "#b45309";
    return "#0a1e5e";
  };

  return (
    <ToolLayout
      badge="YouTube Discovery"
      title="Find YouTube Lookalike Channels"
      subtitle="Find channels similar to any YouTube creator. AI suggests lookalike channels based on content patterns."
      platform="youtube"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={run}
        placeholder="Enter YouTube channel name"
        loading={loading}
        buttonText="Find Lookalikes"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.lookalikes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Source Info */}
            {result.sourceChannel && (
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Similar To</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#0a1e5e" }}>{result.sourceChannel}</div>
                {result.sharedAudienceTraits && (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
                    {result.sharedAudienceTraits.map((trait: string, i: number) => (
                      <span key={i} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "3px 10px", borderRadius: 12, background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", color: "#0a1e5e", letterSpacing: 1 }}>
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lookalike Cards */}
            {result.lookalikes.map((ch: Lookalike, i: number) => (
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
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", padding: "2px 8px", borderRadius: 8, background: `${getOverlapColor(ch.overlapScore)}15`, border: `1px solid ${getOverlapColor(ch.overlapScore)}40`, color: getOverlapColor(ch.overlapScore), textTransform: "uppercase", letterSpacing: 1 }}>
                      {ch.overlapScore} overlap
                    </span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: "0 0 4px" }}>
                    {ch.similarityReason}
                  </p>
                  {ch.uniqueAngle && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(10,30,94,0.65)", margin: 0, fontStyle: "italic" }}>
                      Unique angle: {ch.uniqueAngle}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div style={{ marginTop: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#92400e", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              These lookalike suggestions are AI-generated based on general knowledge of YouTube content patterns. Channel details and subscriber counts should be verified on YouTube.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
