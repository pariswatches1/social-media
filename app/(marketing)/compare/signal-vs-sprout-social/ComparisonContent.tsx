"use client";

import Link from "next/link";

const COMPARISON_ROWS = [
  { feature: "AI Content Generation", signal: "✅ Built-in", sprout: "❌ Not available", signalWin: true },
  { feature: "Competitor Reverse-Engineering", signal: "✅ Built-in", sprout: "❌ Not available", signalWin: true },
  { feature: "Virality Scoring", signal: "✅ AI-powered", sprout: "❌ Not available", signalWin: true },
  { feature: "A/B/C Content Variations", signal: "✅ Up to 3", sprout: "❌ Not available", signalWin: true },
  { feature: "Content Scheduling", signal: "✅ Included", sprout: "✅ Included", signalWin: false },
  { feature: "Auto-Publishing (all platforms)", signal: "✅ Included", sprout: "✅ Included", signalWin: false },
  { feature: "Brand Voice Kit", signal: "✅ Included", sprout: "✅ Included", signalWin: false },
  { feature: "Content Library", signal: "✅ Included", sprout: "✅ Included", signalWin: false },
  { feature: "Activity Inbox", signal: "✅ Included", sprout: "✅ Included", signalWin: false },
  { feature: "Approval Workflows", signal: "✅ Agency tier", sprout: "✅ Advanced tier", signalWin: false },
  { feature: "Social Listening", signal: "🔜 Coming v3", sprout: "✅ Add-on ($)", signalWin: false, comingSoon: true },
  { feature: "Starting Price", signal: "✅ $29/mo", sprout: "❌ $299/mo", signalWin: true },
  { feature: "Free Plan", signal: "✅ Yes", sprout: "❌ No", signalWin: true },
];

const SIGNAL_FEATURES = ["AI Generation", "Competitor Intel", "Virality Scoring", "Scheduling", "Auto-Publishing", "Brand Kit", "Library", "Inbox"];
const SPROUT_FEATURES = ["Scheduling", "Auto-Publishing", "Brand Kit", "Library", "Inbox"];

const PAIN_POINTS = [
  {
    icon: "💸",
    title: "$299/mo adds up fast",
    body: "Sprout\u2019s entry plan is $299/mo per user. For a small team of 3, that\u2019s nearly $11,000/year \u2014 before add-ons like social listening. SIGNAL gives you more for $29/mo flat.",
  },
  {
    icon: "🤖",
    title: "No AI content generation",
    body: "Sprout can schedule and publish your content. But it can\u2019t write it, score it for virality, or reverse-engineer what\u2019s working for your competitors. SIGNAL was built AI-first from day one.",
  },
  {
    icon: "😵",
    title: "Built for enterprise, not creators",
    body: "Sprout Social is a powerful tool built for large teams with dedicated social managers. If you\u2019re a founder, marketer, or agency owner who moves fast, SIGNAL\u2019s workflow is built for you.",
  },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Marketing Director" },
  { name: "Alex K.", role: "Startup Founder" },
  { name: "Jordan T.", role: "Agency Owner" },
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
          SIGNAL VS SPROUT SOCIAL
        </div>

        <h1 style={{ fontSize: 56, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", lineHeight: 1.1, marginBottom: 6 }}>
          All the power of Sprout Social.
        </h1>
        <h1 style={{ fontSize: 56, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0033CC", lineHeight: 1.1, marginBottom: 24 }}>
          93% less expensive.
        </h1>

        <p style={{ fontSize: 18, color: "rgba(10,10,46,0.7)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 36px" }}>
          SIGNAL gives you AI content generation, competitor intelligence, virality scoring, scheduling, brand kit, and auto-publishing &mdash; starting at $29/mo. Sprout Social starts at $299/mo for the same features.
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
            Sprout Social from $299/mo
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: COMPARISON TABLE ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#FFFFFF", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 10, textAlign: "center" }}>
            FEATURE COMPARISON
          </div>
          <h2 style={{ fontSize: 40, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", textAlign: "center", marginBottom: 48 }}>
            Everything Sprout does. Plus things it can&apos;t.
          </h2>

          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div style={{ padding: 16, background: "#f8fafc" }} />
              <div style={{ padding: 16, background: "#0A0A2E", color: "#FFFC00", textAlign: "center", fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: 1 }}>
                SIGNAL
              </div>
              <div style={{ padding: 16, background: "#f1f5f9", color: "#64748b", textAlign: "center", fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 1 }}>
                Sprout Social
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
                  color: row.sprout.startsWith("❌") ? "#dc2626" : row.sprout.startsWith("✅") ? "#16a34a" : "#64748b",
                  fontWeight: 700,
                }}>
                  {row.sprout}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: PRICE BREAKDOWN ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, #0A0A2E 0%, #0033FF 100%)", padding: "100px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", marginBottom: 10 }}>
              PRICING REALITY CHECK
            </div>
            <h2 style={{ fontSize: 44, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFFFFF" }}>
              Same job. $270/mo cheaper.
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
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Mono', monospace", marginBottom: 24 }}>/month</div>
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

            {/* Sprout Card */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 40,
            }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>Sprout Social</span>
              </div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{ fontSize: 64, fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>$299</div>
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
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginBottom: 24 }}>/month</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {SPROUT_FEATURES.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#f87171", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>
                No AI generation. No virality scoring. No competitor intel.
              </div>
            </div>
          </div>

          {/* Savings callout */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#FFFC00" }}>
              Switch to SIGNAL and save $3,240 every year.
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: WHY PEOPLE SWITCH ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#ffffff", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 10 }}>
              WHY PEOPLE SWITCH
            </div>
            <h2 style={{ fontSize: 40, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E" }}>
              Sprout is great. Until you see the invoice.
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

      {/* ─── SECTION 5: SOCIAL PROOF PLACEHOLDER ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "#f8fafc", padding: "80px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", textAlign: "center", marginBottom: 40 }}>
            Joining hundreds of marketers who made the switch
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                data-testimonial="true"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  padding: 32,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: 18, color: "#f59e0b", marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
                <div style={{ fontSize: 14, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", lineHeight: 1.7, marginBottom: 16 }}>
                  &ldquo;Testimonial coming soon&rdquo;
                </div>
                <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ fontWeight: 600, color: "#0A0A2E" }}>{t.name}</span> &middot; {t.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FINAL CTA ─── */}
      <section style={{ position: "relative", zIndex: 1, background: "linear-gradient(180deg, #00B4FF 0%, #0033FF 100%)", padding: "120px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 48, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFFFFF", marginBottom: 16, lineHeight: 1.15 }}>
          Ready to cut your social media costs by 90%?
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif", marginBottom: 36 }}>
          Start free. No credit card required. Cancel anytime.
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
            Already using Sprout? We&apos;ll help you migrate.
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(10,10,46,0.1)", background: "#f0f4ff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 40 }}>
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0A0A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#0A0A2E", letterSpacing: 1 }}>SIGNAL</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>
              AI-powered content intelligence platform. Analyze competitors, generate viral content, and grow your social media presence.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "X", href: "#", icon: "𝕏" },
                { label: "LinkedIn", href: "#", icon: "in" },
                { label: "Instagram", href: "#", icon: "📷" },
                { label: "YouTube", href: "#", icon: "▶" },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(10,10,46,0.08)", border: "1px solid rgba(10,10,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 12, color: "rgba(10,10,46,0.5)" }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>PRODUCT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Competitor Analysis", "Content Generator", "Brand Voice Kit", "Content Calendar", "Content Library", "Virality Scoring"].map((item) => (
                <Link key={item} href="/sign-up" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>{item}</Link>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>PLATFORMS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Instagram", "LinkedIn", "X / Twitter", "TikTok", "Reddit", "Facebook", "Snapchat"].map((item) => (
                <Link key={item} href="/sign-up" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>{item}</Link>
              ))}
            </div>
          </div>

          {/* Compare */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>COMPARE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/compare/signal-vs-sprout-social" style={{ fontSize: 13, color: "#0A0A2E", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>vs Sprout Social</Link>
              {["vs Hootsuite", "vs Buffer", "vs Later", "vs Socialbee"].map((item) => (
                <span key={item} style={{ fontSize: 13, color: "rgba(10,10,46,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{item} (soon)</span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(10,10,46,0.4)", letterSpacing: 2, marginBottom: 16 }}>COMPANY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["About", "Careers", "Contact", "Press Kit", "Affiliate Program"].map((item) => (
                <a key={item} href="#" style={{ fontSize: 13, color: "rgba(10,10,46,0.55)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(10,10,46,0.08)", padding: "20px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(10,10,46,0.35)", fontFamily: "'DM Mono', monospace" }}>
              © {new Date().getFullYear()} SIGNAL. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a key={item} href="#" style={{ fontSize: 11, color: "rgba(10,10,46,0.35)", textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
