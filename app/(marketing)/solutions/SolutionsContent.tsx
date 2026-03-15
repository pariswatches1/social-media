"use client";

import { useState } from "react";
import Link from "next/link";

/* ── INDUSTRY DATA ─────────────────────────────────────────── */
const INDUSTRIES = [
  {
    slug: "fashion-streetwear",
    icon: "👗",
    title: "Fashion & Streetwear",
    tagline: "Find creators who move culture — not just clothes.",
    color: "#7c3aed",
    stats: { creators: "2.4M+", avgEngagement: "4.2%", campaigns: "18K+" },
    challenges: [
      "Identifying creators whose audience genuinely buys (not just scrolls)",
      "Keeping up with micro-trends that shift weekly",
      "Balancing brand aesthetic with creator authenticity",
    ],
    solutions: [
      "AI-powered style analysis matches your brand DNA to creator aesthetics",
      "Trend radar scans 50M+ posts for emerging fashion movements",
      "Engagement-to-purchase scoring predicts ROI before you spend",
      "Fake follower detection eliminates inflated fashion influencers",
    ],
    tools: [
      { name: "Instagram Audit", href: "/tools/instagram-audit" },
      { name: "Fake Follower Checker", href: "/tools/fake-follower-checker" },
      { name: "Find Influencers by Niche", href: "/tools/find-influencers-by-niche" },
    ],
    caseStudy: {
      metric: "312%",
      label: "Average ROI increase",
      detail: "Fashion brands using SIGNAL see 3x higher conversion rates from influencer campaigns compared to manual outreach.",
    },
  },
  {
    slug: "beauty-skincare",
    icon: "💄",
    title: "Beauty & Skincare",
    tagline: "Authentic reviews that drive real sales.",
    color: "#a855f7",
    stats: { creators: "1.8M+", avgEngagement: "5.1%", campaigns: "22K+" },
    challenges: [
      "Finding creators who do genuine reviews vs paid-only content",
      "Navigating FTC/ASA disclosure requirements at scale",
      "Matching skin types and demographics to product lines",
    ],
    solutions: [
      "Content authenticity scoring separates genuine reviewers from pay-to-post",
      "Audience demographic deep-dives match creator followers to your target buyer",
      "Automated compliance checking flags missing disclosures",
      "Before/after content performance tracking across platforms",
    ],
    tools: [
      { name: "Instagram Engagement Calculator", href: "/tools/instagram-engagement-calculator" },
      { name: "Influencer Pricing Calculator", href: "/tools/influencer-pricing-calculator" },
      { name: "AI Content Ideas Generator", href: "/tools/ai-content-ideas-generator" },
    ],
    caseStudy: {
      metric: "47%",
      label: "Lower CPA",
      detail: "Beauty brands report nearly half the cost-per-acquisition when using SIGNAL's audience matching vs. manual influencer selection.",
    },
  },
  {
    slug: "tech-saas",
    icon: "💻",
    title: "Tech & SaaS",
    tagline: "Turn thought leaders into pipeline generators.",
    color: "#0a1e5e",
    stats: { creators: "890K+", avgEngagement: "3.8%", campaigns: "9K+" },
    challenges: [
      "Finding creators who can explain complex products simply",
      "Long B2B sales cycles make attribution difficult",
      "Tech audiences are skeptical of sponsored content",
    ],
    solutions: [
      "Technical credibility scoring identifies creators with genuine domain expertise",
      "Multi-touch attribution tracks from first view to signed contract",
      "LinkedIn + YouTube cross-platform campaign orchestration",
      "AI generates technical content that sounds authoritative, not salesy",
    ],
    tools: [
      { name: "YouTube Channel Quality Checker", href: "/tools/youtube-channel-quality-checker" },
      { name: "YouTube Search by Niche", href: "/tools/youtube-search-by-niche" },
      { name: "Hashtag Generator", href: "/tools/hashtag-generator" },
    ],
    caseStudy: {
      metric: "5.2x",
      label: "Pipeline multiplier",
      detail: "SaaS companies using SIGNAL-sourced creators generate 5x more qualified leads than traditional paid channels.",
    },
  },
  {
    slug: "food-restaurant",
    icon: "🍕",
    title: "Food & Restaurant",
    tagline: "Fill tables and drive orders with local foodie creators.",
    color: "#b45309",
    stats: { creators: "1.2M+", avgEngagement: "6.3%", campaigns: "14K+" },
    challenges: [
      "Hyperlocal targeting — creators must reach your city/neighborhood",
      "Seasonal menus require fast turnaround on content",
      "Measuring foot traffic from social campaigns",
    ],
    solutions: [
      "Geo-targeted creator discovery finds foodie influencers in your exact market",
      "Rapid-fire content generation for seasonal and limited-time offers",
      "QR-coded landing pages link social views to in-store visits",
      "Multi-location campaign management from a single dashboard",
    ],
    tools: [
      { name: "Search Influencers by Location", href: "/tools/search-influencers-by-location" },
      { name: "Trending Hashtags by Country", href: "/tools/trending-hashtags-by-country" },
      { name: "Instagram Reels Analyzer", href: "/tools/instagram-reels-analyzer" },
    ],
    caseStudy: {
      metric: "2,300+",
      label: "Reservations generated",
      detail: "A single restaurant chain generated 2,300 reservations in one month through SIGNAL-managed influencer campaigns.",
    },
  },
  {
    slug: "fitness-wellness",
    icon: "💪",
    title: "Fitness & Wellness",
    tagline: "Partner with creators who inspire real transformation.",
    color: "#047857",
    stats: { creators: "1.5M+", avgEngagement: "5.7%", campaigns: "16K+" },
    challenges: [
      "Vetting creators for genuine fitness expertise vs aesthetic-only accounts",
      "Tracking supplement/product conversions across platforms",
      "Maintaining brand safety in a space prone to misinformation",
    ],
    solutions: [
      "Expertise verification analyzes content history for genuine fitness knowledge",
      "Cross-platform conversion tracking with unique creator discount codes",
      "Content safety AI flags potentially misleading health claims",
      "Community engagement scoring measures genuine follower interaction",
    ],
    tools: [
      { name: "TikTok Engagement Calculator", href: "/tools/tiktok-engagement-calculator" },
      { name: "TikTok Account Quality Checker", href: "/tools/tiktok-account-quality-checker" },
      { name: "Influencer Comparison", href: "/tools/influencer-comparison" },
    ],
    caseStudy: {
      metric: "89%",
      label: "Repeat collaboration rate",
      detail: "Fitness brands using SIGNAL's matching algorithm see 89% of creators agree to long-term partnerships.",
    },
  },
  {
    slug: "gaming-esports",
    icon: "🎮",
    title: "Gaming & Esports",
    tagline: "Reach millions through the creators gamers actually trust.",
    color: "#5b21b6",
    stats: { creators: "920K+", avgEngagement: "7.1%", campaigns: "11K+" },
    challenges: [
      "Extremely audience-savvy demographics detect inauthenticity instantly",
      "Live streaming metrics differ wildly from static post metrics",
      "Cross-platform presence (Twitch, YouTube, TikTok) complicates tracking",
    ],
    solutions: [
      "Live stream analytics integration tracks concurrent viewers, chat engagement, and clip virality",
      "Gaming genre matching connects your title to creators in the right sub-community",
      "Clip-to-conversion tracking follows viewers from stream highlights to purchase",
      "Community sentiment analysis gauges genuine audience reception",
    ],
    tools: [
      { name: "YouTube Engagement Calculator", href: "/tools/youtube-engagement-calculator" },
      { name: "YouTube Channels Comparison", href: "/tools/youtube-channels-comparison" },
      { name: "YouTube Lookalike Finder", href: "/tools/youtube-lookalike-finder" },
    ],
    caseStudy: {
      metric: "4.8M",
      label: "Impressions per campaign",
      detail: "Gaming studios using SIGNAL average 4.8M impressions per influencer campaign — 3x the industry benchmark.",
    },
  },
  {
    slug: "travel-hospitality",
    icon: "✈️",
    title: "Travel & Hospitality",
    tagline: "Inspire wanderlust that converts into bookings.",
    color: "#0369a1",
    stats: { creators: "780K+", avgEngagement: "4.9%", campaigns: "8K+" },
    challenges: [
      "Content must showcase experiences, not just locations",
      "Seasonal demand requires precise campaign timing",
      "Attribution from inspiration to booking is multi-step",
    ],
    solutions: [
      "Visual quality scoring ensures creators produce stunning destination content",
      "Seasonal trend prediction identifies optimal campaign launch windows",
      "Deep-link tracking follows the full journey from post view to booking confirmation",
      "UGC rights management simplifies content licensing at scale",
    ],
    tools: [
      { name: "Instagram Post Advisor", href: "/tools/instagram-post-advisor" },
      { name: "Instagram Lookalike Finder", href: "/tools/instagram-lookalike-finder" },
      { name: "YouTube Search by Location", href: "/tools/youtube-search-by-location" },
    ],
    caseStudy: {
      metric: "28%",
      label: "Booking increase",
      detail: "Hotel chains using SIGNAL see an average 28% increase in direct bookings during influencer campaign periods.",
    },
  },
  {
    slug: "ecommerce-dtc",
    icon: "🛒",
    title: "E-commerce & DTC",
    tagline: "Turn creator content into your highest-performing sales channel.",
    color: "#b91c1c",
    stats: { creators: "3.1M+", avgEngagement: "4.5%", campaigns: "25K+" },
    challenges: [
      "Proving direct ROI from influencer spend",
      "Managing hundreds of creator relationships simultaneously",
      "Scaling UGC production without sacrificing quality",
    ],
    solutions: [
      "Revenue attribution connects every sale back to the specific creator and post",
      "Built-in CRM manages creator relationships, contracts, and payments",
      "AI-powered content brief generation produces on-brand UGC at scale",
      "Shopify/WooCommerce integration auto-tracks affiliate conversions",
    ],
    tools: [
      { name: "TikTok Influencer Pricing Calculator", href: "/tools/tiktok-influencer-pricing-calculator" },
      { name: "TikTok Fake Follower Checker", href: "/tools/tiktok-fake-follower-checker" },
      { name: "TikTok Accounts Comparison", href: "/tools/tiktok-accounts-comparison" },
    ],
    caseStudy: {
      metric: "$2.4M",
      label: "Revenue attributed",
      detail: "DTC brands on SIGNAL attribute an average of $2.4M in annual revenue directly to influencer-driven campaigns.",
    },
  },
];

export default function SolutionsContent() {
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", color: "#0a1e5e", position: "relative", zIndex: 3 }}>
      {/* ─── HERO ────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 60, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div style={{
            display: "inline-block", padding: "6px 16px", borderRadius: 20,
            background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)",
            fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#0a1e5e",
            letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24,
          }}>
            Solutions by Industry
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", color: "#1a1a2e",
          }}>
            Built for Your Industry.{" "}
            <span style={{ display: "block", color: "#0a1e5e" }}>Powered by AI.</span>
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "rgba(10,30,94,0.65)",
            lineHeight: 1.7, maxWidth: 600, margin: "0 auto",
          }}>
            Every industry has unique challenges. SIGNAL adapts its AI, discovery, and analytics to deliver results that matter in your specific market.
          </p>
        </div>
      </section>

      {/* ─── INDUSTRY QUICK NAV ──────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto 40px", padding: "0 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {INDUSTRIES.map((ind) => (
            <a
              key={ind.slug}
              href={`#${ind.slug}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveIndustry(ind.slug);
                document.getElementById(ind.slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 10,
                background: activeIndustry === ind.slug ? "rgba(10,30,94,0.12)" : "rgba(10,30,94,0.05)",
                border: `1px solid ${activeIndustry === ind.slug ? "rgba(10,30,94,0.2)" : "rgba(10,30,94,0.08)"}`,
                color: activeIndustry === ind.slug ? "#0a1e5e" : "rgba(10,30,94,0.6)",
                fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                textDecoration: "none", transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16 }}>{ind.icon}</span>
              {ind.title}
            </a>
          ))}
        </div>
      </section>

      {/* ─── INDUSTRY SECTIONS ───────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {INDUSTRIES.map((ind) => (
            <div key={ind.slug} id={ind.slug} style={{ scrollMarginTop: 100 }}>
              {/* Industry Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>
                  {ind.icon}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
                    {ind.title}
                  </h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: ind.color, margin: "4px 0 0", fontWeight: 600 }}>
                    {ind.tagline}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Active Creators", value: ind.stats.creators },
                  { label: "Avg Engagement", value: ind.stats.avgEngagement },
                  { label: "Campaigns Run", value: ind.stats.campaigns },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(10,30,94,0.06)", border: "1px solid rgba(10,30,94,0.1)",
                    borderRadius: 12, padding: "18px 20px", textAlign: "center",
                    backdropFilter: "blur(8px)",
                  }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: ind.color }}>{s.value}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(10,30,94,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Challenges */}
                <div style={{
                  background: "rgba(10,30,94,0.06)", border: "1px solid rgba(10,30,94,0.1)",
                  borderRadius: 14, padding: 24, backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                    Industry Challenges
                  </div>
                  {ind.challenges.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                      <span style={{ color: "#b91c1c", fontSize: 14, marginTop: 2, flexShrink: 0 }}>✕</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(10,30,94,0.7)", lineHeight: 1.6 }}>{c}</span>
                    </div>
                  ))}
                </div>

                {/* Solutions */}
                <div style={{
                  background: "rgba(10,30,94,0.08)", border: "1px solid rgba(10,30,94,0.12)",
                  borderRadius: 14, padding: 24, backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: ind.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>
                    How SIGNAL Solves It
                  </div>
                  {ind.solutions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                      <span style={{ color: "#047857", fontSize: 14, marginTop: 2, flexShrink: 0 }}>✓</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Case Study + Related Tools */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                {/* Case Study */}
                <div style={{
                  background: "rgba(10,30,94,0.06)", border: "1px solid rgba(10,30,94,0.1)",
                  borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: ind.color, marginBottom: 4 }}>
                    {ind.caseStudy.metric}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>
                    {ind.caseStudy.label}
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(10,30,94,0.55)", lineHeight: 1.6, margin: 0 }}>
                    {ind.caseStudy.detail}
                  </p>
                </div>

                {/* Related Free Tools */}
                <div style={{
                  background: "rgba(10,30,94,0.06)", border: "1px solid rgba(10,30,94,0.1)",
                  borderRadius: 14, padding: 24, backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(10,30,94,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                    Related Free Tools
                  </div>
                  {ind.tools.map((t) => (
                    <Link key={t.href} href={t.href} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, marginBottom: 8,
                      background: "rgba(10,30,94,0.05)", border: "1px solid rgba(10,30,94,0.08)",
                      textDecoration: "none", transition: "all 0.2s",
                    }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0a1e5e", fontWeight: 500 }}>{t.name}</span>
                      <span style={{ color: "rgba(10,30,94,0.4)", fontSize: 16 }}>→</span>
                    </Link>
                  ))}
                  <Link href="/tools" style={{
                    display: "block", textAlign: "center", marginTop: 12,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: ind.color, fontWeight: 600,
                    textDecoration: "none",
                  }}>
                    View all 25+ free tools →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ──────────────────────────────────── */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>
            Ready to dominate your industry?
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(10,30,94,0.6)", lineHeight: 1.7, marginBottom: 32 }}>
            Join 10,000+ brands using SIGNAL to find the right creators, create viral content, and measure real ROI.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link href="/sign-up" style={{
              padding: "14px 32px", borderRadius: 10, fontSize: 14,
              fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 1,
              background: "#0a1e5e", color: "#fff",
              textDecoration: "none", border: "none",
            }}>
              Start Free Trial
            </Link>
            <Link href="/tools" style={{
              padding: "14px 32px", borderRadius: 10, fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              background: "rgba(10,30,94,0.08)", color: "#0a1e5e",
              border: "1px solid rgba(10,30,94,0.15)", textDecoration: "none",
            }}>
              Try Free Tools
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(10,30,94,0.1)", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(10,30,94,0.4)" }}>
          &copy; {new Date().getFullYear()} SIGNAL. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
