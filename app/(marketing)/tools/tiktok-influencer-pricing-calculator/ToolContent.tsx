"use client";

import { useState } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolResults from "@/components/tools/ToolResults";

export default function ToolContent() {
  const [username, setUsername] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = (username || followerCount) && !loading;

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "tiktok-influencer-pricing-calculator", username, followerCount, engagementRate, niche }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ...data, ...(data.data || {}) });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const inputStyle = { padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(10,30,94,0.12)", background: "rgba(255,255,255,0.9)", color: "#1a1a2e", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%" };

  const pricingRows = result?.pricing ? [
    { label: "Sponsored Post", data: result.pricing.sponsoredPost },
    { label: "Branded Content", data: result.pricing.brandedContent },
    { label: "Live Stream", data: result.pricing.liveStream },
    { label: "Duet Collab", data: result.pricing.duetCollab },
    { label: "Package Deal", data: result.pricing.packageDeal },
  ] : [];

  return (
    <ToolLayout badge="TikTok Pricing" title="TikTok Influencer Pricing Calculator" subtitle="Estimate how much a TikTok creator should charge — AI pricing based on followers, engagement, and niche." platform="tiktok">
      {/* Custom Form */}
      <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Follower Count</label>
            <input value={followerCount} onChange={e => setFollowerCount(e.target.value)} placeholder="e.g. 500000" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Engagement Rate %</label>
            <input value={engagementRate} onChange={e => setEngagementRate(e.target.value)} placeholder="e.g. 5.5" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block" }}>Niche</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. fashion, gaming" style={inputStyle} />
          </div>
        </div>
        <button onClick={run} disabled={!canSubmit} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: canSubmit ? "#0a1e5e" : "rgba(10,30,94,0.15)", color: canSubmit ? "#fff" : "rgba(10,30,94,0.4)", fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", letterSpacing: 0.5 }}>
          {loading ? "Calculating..." : "Calculate Pricing"}
        </button>
      </div>

      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Tier Badge */}
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <span style={{ padding: "6px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", background: "rgba(10,30,94,0.1)", color: "#0a1e5e", border: "1px solid rgba(10,30,94,0.2)" }}>{result.tierLabel} Creator</span>
            </div>

            {/* Pricing Table */}
            <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", background: "rgba(10,30,94,0.06)" }}>
                {["Content Type", "Low", "Average", "High"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {pricingRows.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 18px", borderTop: "1px solid rgba(10,30,94,0.08)" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#0a1e5e" }}>{row.label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(10,30,94,0.6)" }}>${row.data?.low?.toLocaleString()}</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>${row.data?.average?.toLocaleString()}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(10,30,94,0.6)" }}>${row.data?.high?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* CPM / CPE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Est. CPM</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{result.estimatedCPM}</div>
              </div>
              <div style={{ background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Est. CPE</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{result.estimatedCPE}</div>
              </div>
            </div>

            {/* Negotiation Tips */}
            {result.negotiationTips?.length > 0 && (
              <div style={{ background: "rgba(10,30,94,0.05)", border: "1px solid rgba(10,30,94,0.1)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Negotiation Tips</div>
                {result.negotiationTips.map((t: string, i: number) => (
                  <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", padding: "4px 0", display: "flex", gap: 8 }}><span>💡</span> {t}</div>
                ))}
              </div>
            )}

            {result.marketContext && (
              <div style={{ background: "rgba(10,30,94,0.05)", border: "1px solid rgba(10,30,94,0.1)", borderRadius: 12, padding: 18 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", margin: 0, lineHeight: 1.7 }}>{result.marketContext}</p>
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
