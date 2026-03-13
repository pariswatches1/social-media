"use client";

import { useState } from "react";
import Link from "next/link";

interface Tool {
  slug: string;
  name: string;
  description: string;
  platform: "instagram" | "youtube" | "general";
  category: string;
}

const TOOLS: Tool[] = [
  // Instagram API tools
  { slug: "instagram-engagement-calculator", name: "Instagram Engagement Calculator", description: "Calculate the real engagement rate of any Instagram account", platform: "instagram", category: "Analytics" },
  { slug: "instagram-audit", name: "Instagram Account Audit", description: "Get a health score, engagement analysis, and AI recommendations", platform: "instagram", category: "Analytics" },
  { slug: "instagram-post-advisor", name: "AI Instagram Post Advisor", description: "Get AI-powered recommendations to improve your content", platform: "instagram", category: "AI" },
  { slug: "instagram-reels-analyzer", name: "Instagram Reels Analyzer", description: "Analyze Reels performance, play counts, and engagement", platform: "instagram", category: "Analytics" },
  { slug: "fake-follower-checker", name: "Fake Follower Checker", description: "Detect fake followers with AI-powered fraud analysis", platform: "instagram", category: "Analytics" },
  { slug: "influencer-comparison", name: "Influencer Comparison", description: "Compare two Instagram accounts side by side", platform: "instagram", category: "Analytics" },
  // Instagram AI tools
  { slug: "ai-content-ideas-generator", name: "AI Content Ideas Generator", description: "Generate 10 viral content ideas for any niche", platform: "instagram", category: "AI" },
  { slug: "hashtag-generator", name: "Hashtag Generator", description: "Get 30 categorized hashtags for maximum reach", platform: "instagram", category: "AI" },
  { slug: "trending-hashtags-by-country", name: "Trending Hashtags by Country", description: "Discover trending hashtags in any country", platform: "instagram", category: "AI" },
  { slug: "find-influencers-by-niche", name: "Find Influencers by Niche", description: "Discover top creators in any niche with AI", platform: "instagram", category: "Discovery" },
  { slug: "search-influencers-by-location", name: "Search Influencers by Location", description: "Find local influencers in any city or country", platform: "instagram", category: "Discovery" },
  { slug: "instagram-lookalike-finder", name: "Lookalike Finder", description: "Find similar accounts to any Instagram creator", platform: "instagram", category: "Discovery" },
  // YouTube tools
  { slug: "youtube-channel-quality-checker", name: "YouTube Channel Quality Checker", description: "Check the quality score of any YouTube channel", platform: "youtube", category: "Analytics" },
  { slug: "youtube-engagement-calculator", name: "YouTube Engagement Calculator", description: "Calculate engagement rate of any YouTube channel", platform: "youtube", category: "Analytics" },
  { slug: "youtube-subscriber-count-checker", name: "YouTube Subscriber Checker", description: "Check subscriber count, tier, and growth rate", platform: "youtube", category: "Analytics" },
  { slug: "youtube-channels-comparison", name: "YouTube Channels Comparison", description: "Compare two YouTube channels side by side", platform: "youtube", category: "Analytics" },
  { slug: "youtube-search-by-niche", name: "Find YouTube Creators by Niche", description: "Discover YouTube channels in any niche", platform: "youtube", category: "Discovery" },
  { slug: "youtube-lookalike-finder", name: "YouTube Lookalike Finder", description: "Find channels similar to any YouTube creator", platform: "youtube", category: "Discovery" },
  { slug: "youtube-search-by-location", name: "YouTube Creators by Location", description: "Find YouTube influencers in any region", platform: "youtube", category: "Discovery" },
  // General
  { slug: "influencer-pricing-calculator", name: "Influencer Pricing Calculator", description: "Estimate how much influencers charge for posts", platform: "general", category: "AI" },
];

const platformColors: Record<string, string> = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  general: "#06b6d4",
};

const platformIcons: Record<string, string> = {
  instagram: "IG",
  youtube: "YT",
  general: "AI",
};

type Filter = "all" | "instagram" | "youtube" | "general";

export default function ToolsIndexContent() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? TOOLS : TOOLS.filter((t) => t.platform === filter || (filter === "general" && t.platform === "general"));

  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#e2e8f0" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>S</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: 2 }}>SIGNAL</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/sign-in" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Log In</Link>
          <Link href="/sign-up" style={{ fontSize: 13, padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "56px 24px 32px" }}>
        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 16 }}>20+ FREE TOOLS</span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: "#fff", margin: "12px 0 12px", lineHeight: 1.2 }}>Free Social Media Tools</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#64748b", maxWidth: 560, margin: "0 auto" }}>Engagement calculators, hashtag generators, fake follower checkers, AI content ideas, and more. 100% free.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 24px 32px" }}>
        {(["all", "instagram", "youtube"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: "8px 20px", borderRadius: 20, border: `1px solid ${filter === f ? "#06b6d4" : "#1e2535"}`, background: filter === f ? "rgba(6,182,212,0.1)" : "transparent", color: filter === f ? "#06b6d4" : "#64748b", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textTransform: "capitalize" }}
          >
            {f === "all" ? `All (${TOOLS.length})` : f === "instagram" ? `Instagram (${TOOLS.filter((t) => t.platform === "instagram").length})` : `YouTube (${TOOLS.filter((t) => t.platform === "youtube").length})`}
          </button>
        ))}
      </div>

      {/* Tool Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filtered.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{ textDecoration: "none", display: "block", background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: "20px 22px", transition: "all 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1e2535"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${platformColors[tool.platform]}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: platformColors[tool.platform], fontFamily: "'DM Mono', monospace" }}>{platformIcons[tool.platform]}</div>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "2px 8px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", letterSpacing: 1 }}>FREE</span>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1, marginLeft: "auto" }}>{tool.category.toUpperCase()}</span>
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{tool.name}</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(14,116,144,0.08))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 16, padding: "36px 28px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>Want the full suite?</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Get AI-powered competitor analysis, content generation, scheduling, and auto-publishing — all in one platform.</p>
          <Link href="/sign-up" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>Try SIGNAL Free →</Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4a5568" }}>© 2026 SIGNAL. Free tools for creators and marketers.</p>
      </footer>
    </div>
  );
}
