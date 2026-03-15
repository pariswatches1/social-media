"use client";

import { useState } from "react";
import Link from "next/link";

interface Tool {
  slug: string;
  name: string;
  description: string;
  platform: "instagram" | "youtube" | "tiktok" | "general";
  category: "analytics" | "discovery" | "ai" | "comparison" | "pricing";
  icon: string;
}

const TOOLS: Tool[] = [
  // Instagram
  { slug: "instagram-engagement-calculator", name: "Instagram Engagement Calculator", description: "Calculate the real engagement rate of any Instagram account", platform: "instagram", category: "analytics", icon: "IG" },
  { slug: "instagram-audit", name: "Instagram Account Audit", description: "Get a health score, engagement analysis, and AI recommendations", platform: "instagram", category: "analytics", icon: "IG" },
  { slug: "instagram-post-advisor", name: "AI Instagram Post Advisor", description: "Get AI-powered recommendations to improve your content", platform: "instagram", category: "ai", icon: "IG" },
  { slug: "instagram-reels-analyzer", name: "Instagram Reels Analyzer", description: "Analyze Reels performance, play counts, and engagement", platform: "instagram", category: "analytics", icon: "IG" },
  { slug: "fake-follower-checker", name: "Fake Follower Checker", description: "Detect fake followers with AI-powered fraud analysis", platform: "instagram", category: "analytics", icon: "IG" },
  { slug: "influencer-comparison", name: "Influencer Comparison", description: "Compare two Instagram accounts side by side", platform: "instagram", category: "comparison", icon: "IG" },
  { slug: "ai-content-ideas-generator", name: "AI Content Ideas Generator", description: "Generate 10 viral content ideas for any niche", platform: "instagram", category: "ai", icon: "IG" },
  { slug: "hashtag-generator", name: "Hashtag Generator", description: "Get 30 categorized hashtags for maximum reach", platform: "instagram", category: "ai", icon: "IG" },
  { slug: "trending-hashtags-by-country", name: "Trending Hashtags by Country", description: "Discover trending hashtags in any country", platform: "instagram", category: "ai", icon: "IG" },
  { slug: "find-influencers-by-niche", name: "Find Influencers by Niche", description: "Discover top creators in any niche with AI", platform: "instagram", category: "discovery", icon: "IG" },
  { slug: "search-influencers-by-location", name: "Search Influencers by Location", description: "Find local influencers in any city or country", platform: "instagram", category: "discovery", icon: "IG" },
  { slug: "instagram-lookalike-finder", name: "Lookalike Finder", description: "Find similar accounts to any Instagram creator", platform: "instagram", category: "discovery", icon: "IG" },
  { slug: "influencer-pricing-calculator", name: "Influencer Pricing Calculator", description: "Estimate how much influencers charge for posts", platform: "instagram", category: "pricing", icon: "IG" },
  // YouTube
  { slug: "youtube-channel-quality-checker", name: "YouTube Channel Quality Checker", description: "Check the quality score of any YouTube channel", platform: "youtube", category: "analytics", icon: "YT" },
  { slug: "youtube-engagement-calculator", name: "YouTube Engagement Calculator", description: "Calculate engagement rate of any YouTube channel", platform: "youtube", category: "analytics", icon: "YT" },
  { slug: "youtube-subscriber-count-checker", name: "YouTube Subscriber Checker", description: "Check subscriber count, tier, and growth rate", platform: "youtube", category: "analytics", icon: "YT" },
  { slug: "youtube-channels-comparison", name: "YouTube Channels Comparison", description: "Compare two YouTube channels side by side", platform: "youtube", category: "comparison", icon: "YT" },
  { slug: "youtube-search-by-niche", name: "Find YouTube Creators by Niche", description: "Discover YouTube channels in any niche", platform: "youtube", category: "discovery", icon: "YT" },
  { slug: "youtube-lookalike-finder", name: "YouTube Lookalike Finder", description: "Find channels similar to any YouTube creator", platform: "youtube", category: "discovery", icon: "YT" },
  { slug: "youtube-search-by-location", name: "YouTube Creators by Location", description: "Find YouTube influencers in any region", platform: "youtube", category: "discovery", icon: "YT" },
  // TikTok
  { slug: "tiktok-engagement-calculator", name: "TikTok Engagement Calculator", description: "Calculate real engagement rates for any TikTok creator", platform: "tiktok", category: "analytics", icon: "TT" },
  { slug: "tiktok-account-quality-checker", name: "TikTok Account Quality Checker", description: "Get an AI quality score for any TikTok account", platform: "tiktok", category: "analytics", icon: "TT" },
  { slug: "tiktok-fake-follower-checker", name: "TikTok Fake Follower Checker", description: "Detect fake followers and bots on any TikTok account", platform: "tiktok", category: "analytics", icon: "TT" },
  { slug: "tiktok-influencer-pricing-calculator", name: "TikTok Influencer Pricing Calculator", description: "Estimate TikTok creator pricing based on metrics", platform: "tiktok", category: "pricing", icon: "TT" },
  { slug: "tiktok-accounts-comparison", name: "Compare TikTok Accounts", description: "Compare two TikTok creators side by side", platform: "tiktok", category: "comparison", icon: "TT" },
];

const platformColors: Record<string, { bg: string; text: string }> = {
  instagram: { bg: "rgba(131,58,180,0.12)", text: "#5b2c87" },
  youtube: { bg: "rgba(255,0,0,0.08)", text: "#991b1b" },
  tiktok: { bg: "rgba(0,0,0,0.06)", text: "#1a1a2e" },
  general: { bg: "rgba(10,30,94,0.08)", text: "#0a1e5e" },
};

type PlatformFilter = "all" | "instagram" | "youtube" | "tiktok";
type CategoryFilter = "all" | "analytics" | "discovery" | "ai" | "comparison" | "pricing";

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "analytics", label: "Analytics" },
  { key: "discovery", label: "Discovery" },
  { key: "ai", label: "AI Tools" },
  { key: "comparison", label: "Comparison" },
  { key: "pricing", label: "Pricing" },
];

export default function ToolsIndexContent() {
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filtered = TOOLS.filter((t) => {
    if (platformFilter !== "all" && t.platform !== platformFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    return true;
  });

  const platformCount = (p: string) => TOOLS.filter(t => t.platform === p).length;

  // Which categories are available for current platform filter
  const availableCategories = CATEGORIES.filter(c => {
    if (c.key === "all") return true;
    const pool = platformFilter === "all" ? TOOLS : TOOLS.filter(t => t.platform === platformFilter);
    return pool.some(t => t.category === c.key);
  });

  return (
    <div data-tool-page style={{ minHeight: "100vh", background: "linear-gradient(180deg, #00FFFF 0%, #0066FF 100%)", color: "#0a1e5e" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid rgba(10,30,94,0.15)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0a1e5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>S</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#0a1e5e", letterSpacing: 2 }}>SIGNAL</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/sign-in" style={{ fontSize: 13, color: "#0a1e5e", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Log In</Link>
          <Link href="/sign-up" style={{ fontSize: 13, padding: "8px 18px", borderRadius: 8, background: "#0a1e5e", color: "#fff", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 24px 24px" }}>
        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(10,30,94,0.1)", border: "1px solid rgba(10,30,94,0.2)", color: "#0a1e5e", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 16 }}>{TOOLS.length} FREE TOOLS</span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: "#0a1e5e", margin: "12px 0 12px", lineHeight: 1.2 }}>Free Social Media Tools</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(10,30,94,0.7)", maxWidth: 560, margin: "0 auto" }}>Engagement calculators, hashtag generators, fake follower checkers, AI content ideas, and more. 100% free.</p>
      </div>

      {/* Stats Banner */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "0 24px 28px", flexWrap: "wrap" }}>
        {[
          { value: `${TOOLS.length}+`, label: "Free Tools" },
          { value: "3", label: "Platforms" },
          { value: "100%", label: "Free Forever" },
          { value: "AI", label: "Powered" },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(10,30,94,0.06)", border: "1px solid rgba(10,30,94,0.1)", borderRadius: 12, padding: "12px 24px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#0a1e5e" }}>{s.value}</div>
            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two-Tier Filters */}
      <div style={{ textAlign: "center", padding: "0 24px 8px" }}>
        {/* Platform row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {([
            { key: "all" as PlatformFilter, label: `All (${TOOLS.length})` },
            { key: "instagram" as PlatformFilter, label: `Instagram (${platformCount("instagram")})` },
            { key: "youtube" as PlatformFilter, label: `YouTube (${platformCount("youtube")})` },
            { key: "tiktok" as PlatformFilter, label: `TikTok (${platformCount("tiktok")})` },
          ]).map((f) => (
            <button key={f.key} onClick={() => { setPlatformFilter(f.key); setCategoryFilter("all"); }}
              style={{ padding: "8px 20px", borderRadius: 20, border: `1px solid ${platformFilter === f.key ? "#0a1e5e" : "rgba(10,30,94,0.2)"}`, background: platformFilter === f.key ? "rgba(10,30,94,0.14)" : "rgba(255,255,255,0.15)", color: "#0a1e5e", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: platformFilter === f.key ? 600 : 400 }}>
              {f.label}
            </button>
          ))}
        </div>
        {/* Category row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {availableCategories.map((c) => (
            <button key={c.key} onClick={() => setCategoryFilter(c.key)}
              style={{ padding: "5px 14px", borderRadius: 16, border: "none", background: categoryFilter === c.key ? "rgba(10,30,94,0.12)" : "transparent", color: categoryFilter === c.key ? "#0a1e5e" : "rgba(10,30,94,0.5)", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", letterSpacing: 0.5, fontWeight: categoryFilter === c.key ? 600 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filtered.map((tool, index) => {
          const pc = platformColors[tool.platform] || platformColors.general;
          return (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}
              style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.12)", borderRadius: 14, padding: "20px 22px", transition: "all 0.25s ease", cursor: "pointer", backdropFilter: "blur(10px)", animationDelay: `${Math.min(index, 10) * 40}ms` }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.35)"; el.style.borderColor = "rgba(10,30,94,0.25)"; el.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.2)"; el.style.borderColor = "rgba(10,30,94,0.12)"; el.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: pc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: pc.text, fontFamily: "'DM Mono', monospace" }}>{tool.icon}</div>
                <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "2px 8px", borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#166534", letterSpacing: 1 }}>FREE</span>
                <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(10,30,94,0.45)", letterSpacing: 1, marginLeft: "auto", textTransform: "uppercase" }}>{tool.category}</span>
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#0a1e5e", margin: "0 0 6px" }}>{tool.name}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(10,30,94,0.65)", margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
            </Link>
          );
        })}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(10,30,94,0.5)" }}>No tools match this filter. Try a different combination.</p>
        </div>
      )}

      {/* CTA */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(10,30,94,0.15)", borderRadius: 16, padding: "36px 28px", textAlign: "center", backdropFilter: "blur(10px)" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#0a1e5e", margin: "0 0 10px" }}>Need more than free tools?</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(10,30,94,0.65)", margin: "0 0 24px" }}>SIGNAL gives you AI competitor analysis, content generation, auto-publishing across 7 platforms, and more.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/sign-up" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: "#0a1e5e", color: "#fff", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>Start Free Trial →</Link>
            <Link href="/#intro" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: "transparent", border: "1px solid rgba(10,30,94,0.3)", color: "#0a1e5e", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15 }}>See How It Works</Link>
          </div>
        </div>
      </div>

      {/* SEO Text */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "rgba(10,30,94,0.4)", marginBottom: 10 }}>The Best Free Influencer Marketing Tools</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(10,30,94,0.35)", lineHeight: 1.7 }}>
          SIGNAL offers {TOOLS.length} free tools for Instagram, YouTube, and TikTok creators and marketers. Calculate engagement rates, detect fake followers, generate hashtags, find influencers by niche or location, compare accounts, and estimate pricing — all powered by AI. No signup required.
        </p>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(10,30,94,0.15)", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(10,30,94,0.5)" }}>© {new Date().getFullYear()} SIGNAL. Free tools for creators and marketers.</p>
      </footer>
    </div>
  );
}
