"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [platform, setPlatform] = useState("Instagram");
  const [followerCount, setFollowerCount] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = followerCount.trim() && !loading;

  const run = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "influencer-pricing-calculator",
          platform,
          followerCount: Number(followerCount),
          engagementRate: Number(engagementRate) || 3.0,
          niche: niche || "general",
        }),
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
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #1e2535",
    background: "#060810",
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    width: "100%",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    cursor: "pointer",
  };

  const formatPrice = (low: number, high: number) =>
    `$${low.toLocaleString()} — $${high.toLocaleString()}`;

  return (
    <ToolLayout
      badge="Pricing Tool"
      title="Influencer Pricing Calculator"
      subtitle="Calculate how much influencers charge. Estimate rates for posts, stories, and reels based on followers and engagement."
      platform="general"
    >
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={selectStyle}
          >
            <option>Instagram</option>
            <option>YouTube</option>
            <option>TikTok</option>
          </select>
          <input
            type="number"
            placeholder="Follower count"
            value={followerCount}
            onChange={(e) => setFollowerCount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Engagement rate %"
            step="0.1"
            value={engagementRate}
            onChange={(e) => setEngagementRate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Niche (e.g., fitness)"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && run()}
            style={inputStyle}
          />
        </div>
        <button
          onClick={run}
          disabled={!canSubmit}
          style={{
            width: "100%",
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
          }}
        >
          {loading ? "Calculating..." : "Calculate Pricing"}
        </button>
      </div>

      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && result.pricing && (
          <div>
            {/* Tier Badge */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Influencer Tier</div>
              <span style={{ display: "inline-block", padding: "6px 20px", borderRadius: 20, fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", textTransform: "uppercase", letterSpacing: 1 }}>
                {result.tier}
              </span>
            </div>

            {/* Pricing Table */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Estimated Pricing</div>
              {[
                { label: "Single Post", data: result.pricing.singlePost },
                { label: "Story", data: result.pricing.story },
                { label: "Reel / Short", data: result.pricing.reel },
                { label: "Package Deal", data: result.pricing.packageDeal },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: row.label !== "Package Deal" ? "1px solid #1e2535" : "none",
                  }}
                >
                  <div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#e2e8f0" }}>{row.label}</span>
                    {row.data?.includes && (
                      <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#64748b", marginTop: 2 }}>{row.data.includes}</div>
                    )}
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#06b6d4" }}>
                    {row.data ? formatPrice(row.data.lowEstimate, row.data.highEstimate) : "N/A"}
                  </span>
                </div>
              ))}
            </div>

            {/* Factors */}
            {result.factors && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Pricing Factors</div>
                {Object.entries(result.factors).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>{key.replace(/Multiplier/g, "")}: </span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2e8f0" }}>{value as string}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Negotiation Tips */}
            {result.negotiationTips && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Negotiation Tips</div>
                {result.negotiationTips.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#06b6d4" }}>{i + 1}.</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2e8f0" }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CPM */}
            {result.cpmEstimate && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Est. CPM</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{result.cpmEstimate}</div>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
