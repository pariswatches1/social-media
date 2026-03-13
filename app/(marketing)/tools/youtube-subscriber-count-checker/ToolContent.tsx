"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolInput from "@/components/tools/ToolInput";
import ToolResults from "@/components/tools/ToolResults";

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
        body: JSON.stringify({ tool: "youtube-subscriber-count-checker", handle }),
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

  const getTierColor = (tier: string) => {
    const t = tier?.toLowerCase() || "";
    if (t.includes("mega")) return "#a855f7";
    if (t.includes("macro")) return "#3b82f6";
    if (t.includes("mid")) return "#06b6d4";
    if (t.includes("rising")) return "#22c55e";
    return "#f59e0b";
  };

  return (
    <ToolLayout
      badge="YouTube Tool"
      title="YouTube Subscriber Count Checker"
      subtitle="Check the subscriber count of any YouTube channel. See subscriber tier, growth rate, and milestones."
      platform="youtube"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={run}
        placeholder="Enter YouTube channel name"
        loading={loading}
        buttonText="Check Subscribers"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Subscriber Count Hero */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 28, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                {result.channelName || "Subscribers"}
              </div>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#FF0000" }}>
                {result.estimatedSubscribers}
              </div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: `${getTierColor(result.subscriberTier)}18`, color: getTierColor(result.subscriberTier), border: `1px solid ${getTierColor(result.subscriberTier)}40` }}>
                {result.subscriberTier}
              </span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Monthly Growth", value: result.estimatedMonthlyGrowth },
                { label: "Growth Rate", value: result.monthlyGrowthRate },
                { label: "Category", value: result.channelCategory },
                { label: "Milestone", value: result.milestoneProgress },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Milestone Progress Bar */}
            {result.subscriberCount && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Milestone Progress</div>
                {(() => {
                  const milestones = [1000, 10000, 100000, 1000000, 10000000, 100000000];
                  const next = milestones.find((m) => m > result.subscriberCount) || milestones[milestones.length - 1];
                  const prev = milestones[milestones.indexOf(next) - 1] || 0;
                  const progress = Math.min(((result.subscriberCount - prev) / (next - prev)) * 100, 100);
                  const formatNum = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(0)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`;
                  return (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8" }}>{formatNum(prev)}</span>
                        <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#FF0000" }}>{formatNum(next)}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "#1e2535" }}>
                        <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg, #FF0000, #ff4444)", width: `${progress}%`, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Summary */}
            {result.summary && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Analysis</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2e8f0", margin: 0, lineHeight: 1.6 }}>{result.summary}</p>
              </div>
            )}

            {/* YouTube API Note */}
            <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#06b6d4", fontSize: 12, padding: 12, borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>
              YouTube API integration coming soon for real-time subscriber counts. Current results are AI-powered estimates.
            </div>
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
