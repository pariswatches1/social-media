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

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "instagram-engagement-calculator", handle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rate: number) => {
    if (rate >= 5) return "#22c55e";
    if (rate >= 2) return "#f59e0b";
    return "#ef4444";
  };

  const getRatingLabel = (rate: number) => {
    if (rate >= 5) return "Excellent";
    if (rate >= 3) return "Good";
    if (rate >= 1) return "Average";
    return "Low";
  };

  return (
    <ToolLayout
      badge="FREE INSTAGRAM TOOL"
      title="Instagram Engagement Rate Calculator"
      subtitle="Calculate the real engagement rate of any Instagram account. Get a full breakdown of likes, comments, and media performance."
      platform="instagram"
    >
      <ToolInput
        value={handle}
        onChange={setHandle}
        onSubmit={analyze}
        placeholder="Enter Instagram handle"
        loading={loading}
        buttonText="Calculate"
      />
      <ToolResults loading={loading} error={error} dataSource={result?.dataSource}>
        {result?.success && (
          <div>
            {/* Engagement Rate Hero */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 28, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Engagement Rate</div>
              <div style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: getRatingColor(result.engagementRate) }}>
                {result.engagementRate?.toFixed(2)}%
              </div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: `${getRatingColor(result.engagementRate)}18`, color: getRatingColor(result.engagementRate), border: `1px solid ${getRatingColor(result.engagementRate)}40` }}>
                {getRatingLabel(result.engagementRate)}
              </span>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Avg Likes", value: result.avgLikes?.toLocaleString() },
                { label: "Avg Comments", value: result.avgComments?.toLocaleString() },
                { label: "Likes Ratio", value: `${result.likesRatio?.toFixed(2)}%` },
                { label: "Comments Ratio", value: `${result.commentsRatio?.toFixed(2)}%` },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Media Type Distribution */}
            {result.mediaDistribution && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Media Type Distribution</div>
                {result.mediaDistribution.map((item: any) => (
                  <div key={item.type} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>{item.type}</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#06b6d4" }}>{item.percentage?.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#1e2535" }}>
                      <div style={{ height: 6, borderRadius: 3, background: "linear-gradient(90deg, #06b6d4, #0891b2)", width: `${item.percentage}%`, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top Posts */}
            {result.topPosts && result.topPosts.length > 0 && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Top 3 Posts</div>
                {result.topPosts.slice(0, 3).map((post: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid #1e2535" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#06b6d4", width: 24 }}>#{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>{post.type}</div>
                        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>{post.date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>{post.engagement?.toLocaleString()} engagements</div>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#22c55e" }}>{post.engagementRate?.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ToolResults>
    </ToolLayout>
  );
}
