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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const d = json.data || {};
      const parseRate = (v: any) => typeof v === "string" ? parseFloat(v) : (v ?? 0);
      const mediaDist = d.mediaTypeDistribution
        ? Object.entries(d.mediaTypeDistribution).map(([type, pct]) => ({
            type,
            percentage: parseFloat(String(pct)),
          }))
        : undefined;
      const topPosts = (d.top3PostsByEngagement || d.topPosts)?.map((p: any) => ({
        type: p.mediaType || p.type,
        date: p.date || "",
        engagement: (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
        engagementRate: parseRate(p.engagementRate),
      }));
      setResult({
        ...json,
        ...d,
        engagementRate: parseRate(d.overallEngagementRate),
        avgLikes: d.averageLikesPerPost,
        avgComments: d.averageCommentsPerPost,
        likesRatio: parseRate(d.likesToFollowerRatio),
        commentsRatio: parseRate(d.commentsToFollowerRatio),
        mediaDistribution: mediaDist,
        topPosts,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rate: number) => {
    if (rate >= 5) return "#166534";
    if (rate >= 2) return "#b45309";
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
            <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 28, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Engagement Rate</div>
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
                <div key={stat.label} style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Media Type Distribution */}
            {result.mediaDistribution && (
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Media Type Distribution</div>
                {result.mediaDistribution.map((item: any) => (
                  <div key={item.type} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e" }}>{item.type}</span>
                      <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#0a1e5e" }}>{item.percentage?.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(10,30,94,0.08)" }}>
                      <div style={{ height: 6, borderRadius: 3, background: "linear-gradient(90deg, #1e40af, #1d4ed8)", width: `${item.percentage}%`, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top Posts */}
            {result.topPosts && result.topPosts.length > 0 && (
              <div style={{ background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Top 3 Posts</div>
                {result.topPosts.slice(0, 3).map((post: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.3)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#0a1e5e", width: 24 }}>#{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e" }}>{post.type}</div>
                        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)" }}>{post.date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#1a1a2e" }}>{post.engagement?.toLocaleString()} engagements</div>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#166534" }}>{post.engagementRate?.toFixed(2)}%</div>
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
