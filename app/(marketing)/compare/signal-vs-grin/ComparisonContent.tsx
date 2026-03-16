"use client";

import Link from "next/link";

const COMPARISON_ROWS = [
  { feature: "AI Content Generation", signal: "✅ Built-in", grin: "❌ Not available", signalWin: true },
  { feature: "Virality Scoring", signal: "✅ AI-powered", grin: "❌ Not available", signalWin: true },
  { feature: "Competitor Reverse-Engineering", signal: "✅ Built-in", grin: "❌ Not available", signalWin: true },
  { feature: "A/B/C Content Variations", signal: "✅ Up to 3", grin: "❌ Not available", signalWin: true },
  { feature: "Creator Discovery", signal: "✅ 6-platform search", grin: "✅ 100M+ database", signalWin: false },
  { feature: "CRM & Relationship Mgmt", signal: "✅ Built-in", grin: "✅ Advanced CRM", signalWin: false },
  { feature: "Content Scheduling", signal: "✅ 9 platforms", grin: "❌ Not built-in", signalWin: true },
  { feature: "Auto-Publishing", signal: "✅ 9 platforms", grin: "❌ Not built-in", signalWin: true },
  { feature: "Brand Voice Kit", signal: "✅ Included", grin: "❌ Not available", signalWin: true },
  { feature: "Content Library", signal: "✅ Included", grin: "✅ Content Management", signalWin: false },
  { feature: "Creator Payments", signal: "🔜 Coming soon", grin: "✅ Built-in", signalWin: false, comingSoon: true },
  { feature: "Product Gifting/Seeding", signal: "🔜 Coming soon", grin: "✅ Shopify integration", signalWin: false, comingSoon: true },
  { feature: "Social Listening", signal: "🔜 Coming v3", grin: "✅ Built-in", signalWin: false, comingSoon: true },
  { feature: "Affiliate Tracking", signal: "🔜 Coming soon", grin: "✅ Built-in", signalWin: false, comingSoon: true },
  { feature: "Reporting & Analytics", signal: "✅ Real-time", grin: "✅ Advanced", signalWin: false },
  { feature: "AI Assistant", signal: "✅ Claude AI", grin: "✅ Gia AI", signalWin: false },
  { feature: "Free Tools (SEO)", signal: "✅ 25 free tools", grin: "❌ None", signalWin: true },
  { feature: "Free Plan", signal: "✅ Yes, forever", grin: "❌ No (demo only)", signalWin: true },
  { feature: "Starting Price", signal: "✅ $29/mo", grin: "❌ ~$999/mo", signalWin: true },
  { feature: "Contract Required", signal: "✅ No — cancel anytime", grin: "❌ Annual contract", signalWin: true },
];

const SIGNAL_FEATURES = [
  "AI Content Generation",
  "Virality Scoring",
  "Competitor Intel",
  "Creator Discovery (6 platforms)",
  "Auto-Publishing (9 platforms)",
  "Brand Voice Kit",
  "Content Calendar",
  "25 Free SEO Tools",
  "CRM & Outreach",
  "Real-time Analytics",
];

const GRIN_FEATURES = [
  "Creator Discovery (100M+)",
  "Relationship CRM",
  "Content Management",
  "Creator Payments",
  "Product Gifting",
  "Reporting & Analytics",
  "Gia AI Assistant",
  "Social Listening",
];

const GRIN_MODULES = [
  { name: "Creator Discovery", desc: "Search 100M+ creators across Instagram, TikTok, YouTube. Advanced filters, lookalikes, audience reports, web extension, landing pages, social listening." },
  { name: "Gia AI Assistant", desc: "AI agent for creator marketing. Automates discovery, outreach, follow-ups. Prompt-based — tell it what you need and it handles the search." },
  { name: "Relationship Management", desc: "Full CRM for creators. Consolidated messaging, personalized briefs, content approval workflows, contract management, mobile-first experience." },
  { name: "Content Management", desc: "Store, tag, and repurpose creator content. Search/filter library, integrations with Google Drive, Dropbox, Box. Track content engagement metrics." },
  { name: "Creator Payments", desc: "Payment table per creator with date, status, owed amounts. PayPal integration, W2 tax docs, withholding rates, expense tracking." },
  { name: "Product Gifting", desc: "Shopify sync for product seeding. Import products, fulfillment tracking, let creators choose products, track shipping and preferences." },
  { name: "Reporting & Analytics", desc: "Activity metrics (prospects added/accepted/completed), impressions, ROI tracking, benchmarking, real-time conversion dashboards." },
  { name: "Software Integrations", desc: "E-commerce (Shopify), communication tools, cloud storage, and more. Centralizes your tech stack into one platform." },
];

const PAIN_POINTS = [
  {
    icon: "💸",
    title: "~$999/mo minimum. Annually.",
    body: "GRIN doesn\u2019t publish pricing — they require a sales call. Industry reports suggest plans start around $999/mo with annual contracts. That\u2019s $12,000/year locked in before you send a single campaign. SIGNAL starts at $29/mo. Cancel anytime.",
  },
  {
    icon: "📝",
    title: "No content creation tools",
    body: "GRIN is built for managing creator relationships and gifting — not for creating content. There\u2019s no AI content generation, no virality scoring, no A/B variations. SIGNAL was built AI-first: generate, score, schedule, and publish.",
  },
  {
    icon: "🏢",
    title: "Built for enterprise, not for you",
    body: "GRIN is designed for large DTC brands with 6-figure influencer budgets. If you\u2019re a startup, agency, or solo marketer, SIGNAL gives you enterprise-level AI tools without the enterprise price tag or annual lock-in.",
  },
];

const TESTIMONIALS = [
  { name: "Marcus L.", role: "DTC Brand Owner", quote: "I looked at GRIN but the annual contract and hidden pricing turned me off. SIGNAL gives me creator discovery, content generation, and scheduling for less than one month of what GRIN would cost." },
  { name: "Priya S.", role: "Marketing Manager", quote: "We needed content creation AND influencer management. GRIN only does half of that. SIGNAL\u2019s AI generates on-brand posts, scores them for virality, then auto-publishes. Game changer." },
  { name: "Jason W.", role: "Agency Founder", quote: "My clients want results fast. GRIN\u2019s sales process took weeks. I signed up for SIGNAL in 30 seconds and had AI-generated content running the same day." },
];

export default function ComparisonContent() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* ─── HERO GRADIENT BG ─── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 900,
          background: "linear-gradient(180deg, #00FFEA 0%, #00B4FF 50%, #0033FF 100%)",
          zIndex: 0,
        }}
      />

      {/* ─── NAV ─── */}
      <nav style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid rgba(10,10,46,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0A0A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
            <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", letterSpacing: 1 }}>SIGNAL</div>
          </Link>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.6)", textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/sign-in" style={{ padding: "8px 20px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(10,10,46,0.2)", color: "#0A0A2E", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
            LOG IN
          </Link>
          <Link href="/sign-up" style={{ padding: "8px 20px", borderRadius: 8, textDecoration: "none", background: "#0A0A2E", color: "#FFFFFF", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600, border: "1px solid rgba(10,10,46,0.5)" }}>
            START FREE →
          </Link>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─── */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "120px 40px 80px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", padding: "4px 16px", background: "rgba(10,10,46,0.1)", border: "1px solid rgba(10,10,46,0.15)", borderRadius: 20, fontSize: 12, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.6)", letterSpacing: "0.15em", marginBottom: 24, fontWeight: 600 }}>
          SIGNAL VS GRIN
        </div>

        <h1 style={{ fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", lineHeight: 1.1, marginBottom: 6 }}>
          Everything GRIN does. Plus AI content creation.
        </h1>
        <h1 style={{ fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0033CC", lineHeight: 1.1, marginBottom: 24 }}>
          97% less expensive.
        </h1>

        <p style={{ fontSize: 18, color: "rgba(10,10,46,0.7)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 36px" }}>
          GRIN charges ~$999/mo with annual contracts for creator management. SIGNAL gives you creator discovery, AI content generation, virality scoring, and auto-publishing across 9 platforms &mdash; starting at $29/mo with no lock-in.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
          <Link href="/sign-up" style={{ padding: "14px 32px", borderRadius: 8, textDecoration: "none", background: "#0A0A2E", color: "#FFFFFF", fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 0.5 }}>
            Start Free &mdash; No Credit Card
          </Link>
          <Link href="/#pricing" style={{ padding: "14px 32px", borderRadius: 8, textDecoration: "none", border: "2px solid #0A0A2E", color: "#0A0A2E", fontSize: 16, fontFamily: "'DM Mono', monospace" }}>
            View Pricing
          </Link>
        </div>

        {/* Price pills */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <div style={{ padding: "8px 20px", borderRadius: 24, background: "#0A0A2E", color: "#FFFC00", fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
            SIGNAL from $29/mo
          </div>
          <div style={{ padding: "8px 20px", borderRadius: 24, background: "rgba(10,10,46,0.1)", color: "#0A0A2E", fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 600, textDecoration: "line-through" }}>
            GRIN from ~$999/mo
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: GRIN UCP BREAKDOWN ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#FFFFFF", padding: "100px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 10, textAlign: "center" }}>
            WHAT GRIN OFFERS
          </div>
          <h2 style={{ fontSize: 40, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", textAlign: "center", marginBottom: 16 }}>
            GRIN&apos;s 8 Core Modules
          </h2>
          <p style={{ fontSize: 16, color: "#64748b", textAlign: "center", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.7 }}>
            GRIN is a full-stack influencer marketing platform. Here&apos;s everything in their control panel &mdash; and what it costs.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {GRIN_MODULES.map((m, i) => (
              <div key={m.name} style={{
                padding: 28,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: i % 2 === 0 ? "#f8fafc" : "#ffffff",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4", background: "rgba(6,182,212,0.08)", padding: "2px 8px", borderRadius: 4 }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#0A0A2E" }}>{m.name}</span>
                </div>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40, padding: "24px 32px", background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca" }}>
            <p style={{ fontSize: 15, color: "#991b1b", fontWeight: 600, margin: 0 }}>
              💰 All of this starts at ~$999/month with a mandatory annual contract (~$12,000/year minimum commitment).
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: COMPARISON TABLE ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#f8fafc", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 10, textAlign: "center" }}>
            FEATURE-BY-FEATURE
          </div>
          <h2 style={{ fontSize: 40, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", textAlign: "center", marginBottom: 48 }}>
            SIGNAL vs GRIN: Side by Side
          </h2>

          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div style={{ padding: 16, background: "#f8fafc" }} />
              <div style={{ padding: 16, background: "#0A0A2E", color: "#FFFC00", textAlign: "center", fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: 1 }}>
                SIGNAL
              </div>
              <div style={{ padding: 16, background: "#f1f5f9", color: "#64748b", textAlign: "center", fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 1 }}>
                GRIN
              </div>
            </div>

            {/* Table rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderTop: "1px solid #e2e8f0",
                  background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                }}
              >
                <div style={{ padding: "14px 20px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#0A0A2E", fontWeight: 600 }}>
                  {row.feature}
                </div>
                <div style={{
                  padding: "14px 20px",
                  fontSize: 14,
                  fontFamily: "'DM Mono', monospace",
                  textAlign: "center",
                  backgroundColor: "rgba(10,10,46,0.03)",
                  borderLeft: "3px solid #0A0A2E",
                  color: row.signal.startsWith("✅") ? "#16a34a" : row.comingSoon ? "#d97706" : "#16a34a",
                  fontWeight: 700,
                }}>
                  {row.signal}
                </div>
                <div style={{
                  padding: "14px 20px",
                  fontSize: 14,
                  fontFamily: "'DM Mono', monospace",
                  textAlign: "center",
                  color: row.grin.startsWith("❌") ? "#dc2626" : row.grin.startsWith("✅") ? "#16a34a" : "#64748b",
                  fontWeight: 700,
                }}>
                  {row.grin}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: PRICE BREAKDOWN ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #0A0A2E 0%, #0033FF 100%)", padding: "100px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", marginBottom: 10 }}>
              PRICING REALITY CHECK
            </div>
            <h2 style={{ fontSize: 44, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFFFFF" }}>
              Same results. $970/mo cheaper.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* SIGNAL Card */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(255,252,0,0.5)",
              borderRadius: 16,
              padding: 40,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "#FFFC00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚡</div>
                <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFFFFF", letterSpacing: 1 }}>SIGNAL</span>
              </div>
              <div style={{ fontSize: 64, fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "#FFFC00", lineHeight: 1 }}>$29</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Mono', monospace", marginBottom: 24 }}>/month &middot; no contract</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {SIGNAL_FEATURES.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#FFFFFF", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/sign-up" style={{
                display: "block",
                textAlign: "center",
                padding: "12px 24px",
                borderRadius: 8,
                backgroundColor: "#FFFC00",
                color: "#0A0A2E",
                fontSize: 14,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}>
                Start Free Today
              </Link>
            </div>

            {/* GRIN Card */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 40,
            }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>GRIN</span>
              </div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{ fontSize: 64, fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>$999</div>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: -4,
                  right: -4,
                  height: 3,
                  background: "#ef4444",
                  transform: "rotate(-12deg)",
                  borderRadius: 2,
                }} />
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 24 }}>/month &middot; annual contract required</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {GRIN_FEATURES.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#f87171", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>
                No AI content generation. No virality scoring. No content scheduling. No free plan.
              </div>
            </div>
          </div>

          {/* Savings callout */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#FFFC00" }}>
              Switch to SIGNAL and save $11,640 every year.
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHY PEOPLE SWITCH ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#ffffff", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 10 }}>
              WHY TEAMS CHOOSE SIGNAL
            </div>
            <h2 style={{ fontSize: 40, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E" }}>
              GRIN is powerful. But is it worth $12K/year?
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {PAIN_POINTS.map((p) => (
              <div key={p.title} style={{
                backgroundColor: "#f8fafc",
                borderRadius: 12,
                padding: 40,
                border: "1px solid #e2e8f0",
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#0A0A2E", marginBottom: 12, lineHeight: 1.3 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 14, color: "#475569", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: SOCIAL PROOF ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#f8fafc", padding: "80px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", textAlign: "center", marginBottom: 40 }}>
            Teams choosing SIGNAL over enterprise tools
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  padding: 32,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: 18, color: "#f59e0b", marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
                <div style={{ fontSize: 14, color: "#475569", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", lineHeight: 1.7, marginBottom: 16 }}>
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ fontWeight: 600, color: "#0A0A2E" }}>{t.name}</span> &middot; {t.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: FINAL CTA ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "linear-gradient(180deg, #00B4FF 0%, #0033FF 100%)", padding: "120px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 48, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFFFFF", marginBottom: 16, lineHeight: 1.15 }}>
          Ready for enterprise power at startup prices?
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif", marginBottom: 36 }}>
          Start free. No credit card. No annual contract. Cancel anytime.
        </p>
        <Link href="/sign-up" style={{
          display: "inline-block",
          padding: "16px 48px",
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          color: "#0A0A2E",
          fontSize: 18,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          textDecoration: "none",
          letterSpacing: 0.5,
        }}>
          Start For Free →
        </Link>
        <div style={{ marginTop: 16 }}>
          <Link href="#" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
            Already using GRIN? We&apos;ll help you migrate.
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(10,10,46,0.1)", background: "#f0f4ff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0A0A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", letterSpacing: 1 }}>SIGNAL</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>
              AI-powered content intelligence platform. Analyze competitors, generate viral content, and grow your social media presence.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>PRODUCT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Competitor Analysis", "Content Generator", "Brand Voice Kit", "Virality Scoring", "Creator Discovery", "Free Tools"].map((item) => (
                <Link key={item} href={item === "Free Tools" ? "/tools" : "/sign-up"} style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>{item}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>COMPARE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/compare/signal-vs-sprout-social" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>vs Sprout Social</Link>
              <Link href="/compare/signal-vs-grin" style={{ fontSize: 13, color: "#0A0A2E", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>vs GRIN</Link>
              {["vs Hootsuite", "vs Buffer", "vs Later"].map((item) => (
                <span key={item} style={{ fontSize: 13, color: "rgba(10,10,46,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{item} (soon)</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>LEGAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Terms of Service</Link>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>COMPANY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/solutions" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Solutions</Link>
              <a href="mailto:support@influencccer.com" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Contact</a>
              <Link href="/sign-up" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Sign Up</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(10,10,46,0.08)", padding: "20px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(10,10,46,0.35)", fontFamily: "'DM Mono', monospace" }}>
              © {new Date().getFullYear()} SIGNAL. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/privacy" style={{ fontSize: 11, color: "rgba(10,10,46,0.35)", textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: 11, color: "rgba(10,10,46,0.35)", textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
