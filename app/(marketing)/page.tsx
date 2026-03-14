"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ── NAV DROPDOWN DATA ──────────────────────────────── */
const PLATFORM_LINKS: { num: string; title: string; sub: string; href: string }[] = [
  { num: "01", title: "Competitor Analysis", sub: "Reverse-engineer any competitor’s content", href: "#features" },
  { num: "02", title: "AI Generation", sub: "3 angle-tested variations per topic", href: "#features" },
  { num: "03", title: "Virality Scoring", sub: "Score every post before it goes live", href: "#features" },
];
const SOLUTIONS_LINKS: { num: string; title: string; sub: string; href: string }[] = [
  { num: "01", title: "Brand Voice Kit", sub: "Define and apply your brand voice at scale", href: "#features" },
  { num: "02", title: "Content Calendar", sub: "Visual month/week planner for all platforms", href: "#features" },
  { num: "03", title: "Auto-Publishing", sub: "Connect 9 platforms, publish automatically", href: "#platforms" },
  { num: "04", title: "SIGNAL Inbox", sub: "Your content activity hub", href: "#features" },
  { num: "05", title: "Content Library", sub: "Save, search, export, import content", href: "#features" },
  { num: "06", title: "Analytics", sub: "Track performance across all platforms", href: "#features" },
];

/* ── PLATFORM CARDS DATA ─────────────────────────────────── */
const PLATFORMS = [
  { name: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,.08)", border: "rgba(225,48,108,.30)", a08: "rgba(225,48,108,.12)", a20: "rgba(225,48,108,.22)", delay: "d1", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#E1306C" strokeWidth="1.6"/><circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="1.6"/><circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/></svg> },
  { name: "LinkedIn", color: "#0A66C2", bg: "rgba(10,102,194,.08)", border: "rgba(10,102,194,.30)", a08: "rgba(10,102,194,.12)", a20: "rgba(10,102,194,.22)", delay: "d1", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3.5" stroke="#0A66C2" strokeWidth="1.6"/><path d="M7 10v7M7 7.5v.5M11 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M11 10v7" stroke="#0A66C2" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { name: "X / Twitter", color: "#e7e9ea", bg: "rgba(231,233,234,.06)", border: "rgba(231,233,234,.28)", a08: "rgba(231,233,234,.09)", a20: "rgba(231,233,234,.16)", delay: "d2", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 7.5L4 20h2.5l5.2-6 4.8 6H20l-7-8.5L19.5 4H17l-4.8 5.5L7.5 4H4z" fill="#e7e9ea"/></svg> },
  { name: "TikTok", color: "#FF0050", bg: "rgba(255,0,80,.08)", border: "rgba(255,0,80,.30)", a08: "rgba(255,0,80,.12)", a20: "rgba(255,0,80,.22)", delay: "d2", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M9 12a4 4 0 1 0 4 4V4c.5 2 2.5 4 5 4" stroke="#FF0050" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: "Reddit", color: "#FF4500", bg: "rgba(255,69,0,.08)", border: "rgba(255,69,0,.30)", a08: "rgba(255,69,0,.12)", a20: "rgba(255,69,0,.22)", delay: "d3", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#FF4500" strokeWidth="1.6"/><circle cx="9" cy="12" r="1" fill="#FF4500"/><circle cx="15" cy="12" r="1" fill="#FF4500"/><path d="M9 15s1 1.5 3 1.5 3-1.5 3-1.5" stroke="#FF4500" strokeWidth="1.4" strokeLinecap="round"/><circle cx="16.5" cy="7.5" r="1" fill="#FF4500"/><path d="M12 8.5c1.5-1.5 4.5-1 4.5 1" stroke="#FF4500" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { name: "YouTube", color: "#FF0000", bg: "rgba(255,0,0,.08)", border: "rgba(255,0,0,.28)", a08: "rgba(255,0,0,.11)", a20: "rgba(255,0,0,.18)", delay: "d3", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="4" stroke="#FF0000" strokeWidth="1.6"/><path d="M10 9l5 3-5 3V9z" fill="#FF0000"/></svg> },
  { name: "Pinterest", color: "#E60023", bg: "rgba(230,0,35,.08)", border: "rgba(230,0,35,.28)", a08: "rgba(230,0,35,.11)", a20: "rgba(230,0,35,.18)", delay: "d4", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#E60023" strokeWidth="1.6"/><path d="M12 7c-3 0-5 2-5 4.5 0 1.5.8 2.8 2 3.3-.1-.5-.2-1.3 0-1.8l1-4.2s-.3-.5-.3-1.3c0-1.2.7-2 1.7-2 .8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.5 1.6 1.4 1.6 1.6 0 2.8-1.7 2.8-4.2C16 8.7 14.2 7 12 7z" fill="#E60023"/><path d="M11.5 15.5c-.5 2-1.2 3.9-2.5 5" stroke="#E60023" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { name: "Facebook", color: "#1877F2", bg: "rgba(24,119,242,.08)", border: "rgba(24,119,242,.30)", a08: "rgba(24,119,242,.12)", a20: "rgba(24,119,242,.22)", delay: "d4", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#1877F2" strokeWidth="1.6"/><path d="M15.5 8H14c-1.1 0-2 .9-2 2v2h3l-.5 3H12v5h-3v-5H7v-3h2v-2c0-2.2 1.8-4 4-4h2.5v2z" fill="#1877F2"/></svg> },
  { name: "Snapchat", color: "#FFFC00", bg: "rgba(255,252,0,.08)", border: "rgba(255,252,0,.28)", a08: "rgba(255,252,0,.11)", a20: "rgba(255,252,0,.22)", delay: "d5", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 4c-2.5 0-4 1.8-4 4v2c-1 .2-2 .5-2 1s1.5.8 1.5.8c-.5 1.5-2 2.5-2 2.5.5.5 2 .5 3 .2 0 1 .5 2.5 3.5 2.5s3.5-1.5 3.5-2.5c1 .3 2.5.3 3-.2 0 0-1.5-1-2-2.5 0 0 1.5-.3 1.5-.8s-1-.8-2-1V8c0-2.2-1.5-4-4-4z" stroke="#FFFC00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

/* ── PRICING TIERS ────────────────────────────────────────── */
const TIERS = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    tagline: "Get started — no credit card required",
    highlight: false,
    planKey: "FREE",
    features: [
      "3 analyses / month",
      "1 platform per generation",
      "1 content variation",
      "Basic virality scoring",
      "Content library (10 saves)",
    ],
  },
  {
    name: "Creator",
    price: { monthly: 29, annual: 23 },
    tagline: "Perfect for solo creators & freelancers",
    highlight: false,
    planKey: "CREATOR",
    features: [
      "25 analyses / month",
      "All 9 platforms",
      "2 A/B variations",
      "Virality scoring",
      "Creator discovery (100 results)",
      "Brand voice profiles",
      "Content calendar",
      "Unlimited library saves",
    ],
  },
  {
    name: "Pro",
    price: { monthly: 99, annual: 79 },
    tagline: "For growing brands & agencies",
    highlight: true,
    planKey: "PRO",
    features: [
      "Unlimited analyses",
      "All 9 platforms",
      "3 A/B/C variations",
      "Advanced virality scoring",
      "Creator discovery (unlimited)",
      "CRM & outreach tools",
      "Campaign management",
      "SIGNAL Inbox",
    ],
  },
  {
    name: "Agency",
    price: { monthly: 399, annual: 319 },
    tagline: "For scaling teams & power users",
    highlight: false,
    planKey: "AGENCY",
    features: [
      "Everything in Pro",
      "10 team seats",
      "Unlimited brand profiles",
      "Priority AI processing",
      "Post approval workflows",
      "White-label reports",
      "Bulk outreach automation",
      "Dedicated account manager",
      "API access",
    ],
  },
];

/* ── TESTIMONIALS ─────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "SIGNAL tripled our engagement in 6 weeks. The virality scorer alone is worth every penny.", name: "Priya M.", role: "Head of Social, Luxe Brands", avatar: "P" },
  { quote: "Finally an AI tool that sounds like us, not a robot. Our content feels authentic and still gets results.", name: "Jake R.", role: "Founder, GrowthLab", avatar: "J" },
  { quote: "The competitor analysis feature revealed gaps we had no idea existed. Total game-changer.", name: "Sofia K.", role: "CMO, NovaTech", avatar: "S" },
  { quote: "We went from posting twice a week to every day across 5 platforms. No extra headcount.", name: "Marcus T.", role: "VP Marketing, UrbanEdge", avatar: "M" },
];

/* ── FAQs ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q: "Can I try SIGNAL for free?", a: "Yes — we offer a 14-day free trial on all plans. No credit card required." },
  { q: "How does AI content generation work?", a: "SIGNAL’s AI studies your brand voice, past performance, and competitor gaps to generate on-brand content. Each topic gets 3 angle-tested variations." },
  { q: "Which social platforms are supported?", a: "Instagram, LinkedIn, X/Twitter, TikTok, Reddit, YouTube, Pinterest, Facebook, and Snapchat." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. Cancel with one click from your dashboard. No lock-ins, no penalties." },
  { q: "Is my data secure?", a: "SIGNAL is SOC 2 Type II compliant and encrypts all data at rest and in transit. We never sell your data." },
];

/* ── FOOTER LINKS ────────────────────────────────────────── */
const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Free Tools", href: "/tools" },
    { label: "FAQ", href: "#faq" },
  ],
  Company: [
    { label: "About", href: "#hero" },
    { label: "Blog", href: "#hero" },
    { label: "Careers", href: "#hero" },
    { label: "Press", href: "#hero" },
  ],
  Legal: [
    { label: "Privacy", href: "#hero" },
    { label: "Terms", href: "#hero" },
    { label: "Cookies", href: "#hero" },
    { label: "GDPR", href: "#hero" },
  ],
  Support: [
    { label: "Docs", href: "#faq" },
    { label: "Status", href: "#hero" },
    { label: "Community", href: "#hero" },
    { label: "Contact", href: "#hero" },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────── */
/*  PAGE COMPONENT                                                        */
/* ────────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [navOpen, setNavOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEmailSubmit = () => {
    if (emailRef.current && emailRef.current.value.trim()) {
      setEmailSubmitted(true);
      emailRef.current.value = "";
      setTimeout(() => setEmailSubmitted(false), 4000);
    }
  };

  return (
    <>
      {/* ── CSS vars + global resets ── */}
      <style>{`
        :root {
          --bg:   #050811;
          --card: #090d1a;
          --dim:  #4a5568;
          --muted:#2d3748;
          --glow: #06b6d4;
          --grad: linear-gradient(135deg,#0891b2,#0e7490);
          --hi:   #e2e8f0;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--hi); font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; font-family: inherit; }
        /* animations */
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse    { 0%,100% { opacity:.6 } 50% { opacity:1 } }
        @keyframes spin     { to { transform:rotate(360deg) } }
        @keyframes shimmer  { from { background-position:-200% 0 } to { background-position:200% 0 } }
        .anim-fadeUp  { animation: fadeUp .7s ease both }
        .anim-fadeIn  { animation: fadeIn .5s ease both }
        .d1 { animation-delay:.1s } .d2 { animation-delay:.2s }
        .d3 { animation-delay:.3s } .d4 { animation-delay:.4s }
        /* pill */
        .pill { display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:999px;
                border:1px solid rgba(6,182,212,.35);background:rgba(6,182,212,.08);
                font-size:11px;letter-spacing:1px;font-family:'DM Mono',monospace;color:#06b6d4; }
        /* glass card */
        .glass { background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:16px; }
        /* cta button */
        .cta-btn { padding:14px 32px;border-radius:10px;border:none;
                   background:var(--grad);color:#fff;
                   font-size:14px;font-family:'DM Mono',monospace;letter-spacing:1.2px;font-weight:600;
                   box-shadow:0 4px 20px rgba(8,145,178,.35);
                   transition:box-shadow .2s,transform .15s; }
        .cta-btn:hover { box-shadow:0 8px 32px rgba(8,145,178,.55);transform:translateY(-1px); }
        /* ghost button */
        .ghost-btn { padding:13px 28px;border-radius:10px;border:1px solid rgba(255,255,255,.12);
                     background:transparent;color:var(--hi);
                     font-size:13px;font-family:'DM Mono',monospace;letter-spacing:1px;
                     transition:border-color .2s,background .2s; }
        .ghost-btn:hover { border-color:rgba(6,182,212,.5);background:rgba(6,182,212,.06); }
        /* section heading */
        .sec-head { font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,48px);font-weight:800;
                    color:var(--hi);line-height:1.1;letter-spacing:-.5px; }
        .sec-sub { font-size:16px;color:var(--dim);line-height:1.7;max-width:560px; }
        /* input */
        .hero-input { flex:1;min-width:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
                      border-radius:10px;padding:14px 20px;color:#fff;font-size:14px;
                      font-family:'DM Sans',sans-serif;outline:none;
                      transition:border-color .2s; }
        .hero-input:focus { border-color:rgba(6,182,212,.5); }
        .hero-input::placeholder { color:var(--dim); }
        /* ── Responsive ── */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .stats-row { flex-direction: column !important; gap: 12px !important; }
          .nav-right { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* ════ NAVBAR ════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", padding: "0 40px", height: 64,
        background: scrolled ? "rgba(5,8,17,.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
        transition: "background .3s, border .3s, backdrop-filter .3s",
      }}>
        {/* Logo */}
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -.5, marginRight: 40 }}>
          SIGNAL
          <span style={{ color: "#06b6d4" }}>.</span>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
          background: "transparent", border: "none", color: "#e2e8f0", fontSize: 22,
          marginLeft: "auto", padding: 8, alignItems: "center", justifyContent: "center",
        }}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Nav links */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
          {["Platform", "Solutions", "Pricing", "Free Tools"].map((item) => {
            const hasDropdown = item === "Platform" || item === "Solutions";
            const isOpen = navOpen === item;
            const links = item === "Platform" ? PLATFORM_LINKS : SOLUTIONS_LINKS;
            return (
              <div key={item} style={{ position: "relative" }}
                onMouseEnter={() => hasDropdown && setNavOpen(item)}
                onMouseLeave={() => setNavOpen(null)}>
                {hasDropdown ? (
                  <button style={{
                    padding: "8px 14px", borderRadius: 8, border: "none",
                    background: isOpen ? "rgba(255,255,255,.06)" : "transparent",
                    color: isOpen ? "#e2e8f0" : "#94a3b8",
                    fontSize: 13, display: "flex", alignItems: "center", gap: 5,
                    transition: "color .2s, background .2s",
                  }}>
                    {item}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                ) : (
                  <a href={item === "Pricing" ? "#pricing" : "/tools"} onClick={(e) => { if (item === "Pricing") { e.preventDefault(); const el = document.querySelector("#pricing"); if (el) el.scrollIntoView({ behavior: "smooth" }); } }} style={{
                    padding: "8px 14px", borderRadius: 8, border: "none",
                    background: "transparent",
                    color: "#94a3b8",
                    fontSize: 13, display: "flex", alignItems: "center", gap: 5,
                    transition: "color .2s, background .2s", textDecoration: "none",
                  }}>
                    {item}
                  </a>
                )}

                {/* Dropdown */}
                {hasDropdown && isOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0,
                    paddingTop: 8,
                  }}>
                  <div style={{
                    background: "#0a0e1c", border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 12, padding: 8, minWidth: 260,
                    boxShadow: "0 16px 48px rgba(0,0,0,.5)",
                    animation: "fadeIn .15s ease",
                  }}>
                    {links.map((l) => (
                      <a key={l.num} href={l.href} onClick={(e) => { e.preventDefault(); setNavOpen(null); const el = document.querySelector(l.href); if (el) el.scrollIntoView({ behavior: "smooth" }); }} style={{
                        display: "flex", gap: 12, padding: "10px 12px", borderRadius: 8,
                        transition: "background .15s", textDecoration: "none",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#06b6d4", paddingTop: 2 }}>{l.num}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{l.title}</div>
                          <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{l.sub}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right CTAs */}
        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/sign-in" style={{ padding: "8px 16px", fontSize: 13, color: "#94a3b8", transition: "color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}>
            Log in
          </Link>
          <Link href="/sign-up" className="cta-btn" style={{ padding: "9px 20px", fontSize: 12, letterSpacing: "1px" }}>
            Start free trial
          </Link>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: "rgba(5,8,17,.96)", backdropFilter: "blur(16px)",
          padding: "24px 24px", overflowY: "auto",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Platform", "Solutions", "Pricing", "Free Tools"].map((item) => {
              if (item === "Pricing") {
                return (
                  <a key={item} href="#pricing" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" }); }}
                    style={{ padding: "12px 16px", fontSize: 15, color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {item}
                  </a>
                );
              }
              if (item === "Free Tools") {
                return (
                  <Link key={item} href="/tools" onClick={() => setMobileMenuOpen(false)}
                    style={{ padding: "12px 16px", fontSize: 15, color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {item}
                  </Link>
                );
              }
              const links = item === "Platform" ? PLATFORM_LINKS : SOLUTIONS_LINKS;
              return (
                <div key={item}>
                  <div style={{ padding: "12px 16px", fontSize: 15, color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>{item}</div>
                  <div style={{ paddingLeft: 16 }}>
                    {links.map((l) => (
                      <a key={l.num} href={l.href} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" }); }}
                        style={{ display: "block", padding: "8px 16px", fontSize: 13, color: "#94a3b8" }}>
                        {l.title}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24, padding: "0 16px" }}>
            <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} style={{ padding: "12px", textAlign: "center", fontSize: 14, color: "#94a3b8", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }}>Log in</Link>
            <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="cta-btn" style={{ textAlign: "center" }}>Start free trial</Link>
          </div>
        </div>
      )}


      {/* ════ HERO ══════════════════════════════════════════════════════════════ */}
      <section id="hero" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px", position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,.12) 0%, transparent 70%)",
          top: "10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none",
        }} />

        <div className="pill anim-fadeIn" style={{ marginBottom: 28 }}>
          ✨ AI-Powered Social Media Intelligence
        </div>

        <h1 className="anim-fadeUp" style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 900,
          fontSize: "clamp(36px,7vw,80px)", lineHeight: 1.05,
          letterSpacing: "-1.5px", marginBottom: 24, maxWidth: 900,
        }}>
          Dominate every feed with
          <span style={{
            background: "linear-gradient(135deg,#06b6d4,#0ea5e9,#38bdf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}> AI-crafted content</span>
        </h1>

        <p className="anim-fadeUp d1" style={{
          fontSize: "clamp(15px,2vw,19px)", color: "#64748b", lineHeight: 1.7,
          maxWidth: 560, marginBottom: 40,
        }}>
          SIGNAL analyses competitors, generates on-brand posts, scores virality,
          and auto-publishes across 9 platforms — so you show up everywhere, every day.
        </p>

        {/* CTA row */}
        <div className="anim-fadeUp d2" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          <Link href="/sign-up" className="cta-btn">
            Start free — 14-day trial
          </Link>
          <button className="ghost-btn" onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}>
            Explore features ↓
          </button>
        </div>

        <p className="anim-fadeUp d3" style={{ fontSize: 12, color: "#2d3748", letterSpacing: ".5px", fontFamily: "'DM Mono',monospace" }}>
          No credit card required · Cancel any time
        </p>

        {/* Email capture */}
        <div className="anim-fadeUp d4" style={{
          display: "flex", gap: 10, marginTop: 36, width: "100%", maxWidth: 480, flexWrap: "wrap",
        }}>
          <input ref={emailRef} className="hero-input" placeholder="Enter your work email" type="email" onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()} />
          <button className="cta-btn" onClick={handleEmailSubmit} style={{ whiteSpace: "nowrap", padding: "14px 24px" }}>
            {emailSubmitted ? "Thank you!" : "Get early access"}
          </button>
        </div>

        {/* Social proof */}
        <div className="anim-fadeUp d4" style={{
          display: "flex", alignItems: "center", gap: 20, marginTop: 48, flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { val: "2,400+", label: "brands" },
            { val: "47M+",   label: "posts scheduled" },
            { val: "4.9★",   label: "avg rating" },
          ].map(({ val, label }) => (
            <div key={val} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#e2e8f0" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ PLATFORM LOGOS ════════════════════════════════════════════════════ */}
      <section id="platforms" style={{ padding: "24px 40px 48px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#2d3748", letterSpacing: 2, marginBottom: 28 }}>
          PUBLISH ACROSS ALL MAJOR PLATFORMS
        </p>
        <div style={{
          display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
        }}>
          {PLATFORMS.map((p) => (
            <div key={p.name} className={`glass anim-fadeUp ${p.delay}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "16px 20px", minWidth: 96, cursor: "default",
              border: `1px solid ${p.border}`,
              transition: "transform .2s, box-shadow .2s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${p.a20}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              }}
            >
              {p.icon}
              <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: p.color, letterSpacing: 1 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pill" style={{ marginBottom: 16 }}>PLATFORM FEATURES</div>
          <h2 className="sec-head">Everything you need to dominate social</h2>
          <p className="sec-sub" style={{ margin: "16px auto 0" }}>
            From AI content generation to real-time analytics — SIGNAL covers the entire creator lifecycle.
          </p>
        </div>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          {[
            {
              icon: "🧠",
              title: "AI Content Generation",
              desc: "Generate 3 angle-tested post variations per topic. Trained on your brand voice and top-performing content.",
              color: "#06b6d4",
            },
            {
              icon: "🔍",
              title: "Competitor Analysis",
              desc: "Reverse-engineer any competitor’s top content. Find the gaps they’re missing and own them.",
              color: "#8b5cf6",
            },
            {
              icon: "📈",
              title: "Virality Scoring",
              desc: "Score every post before publishing with our proprietary algorithm trained on 47M+ posts.",
              color: "#f59e0b",
            },
            {
              icon: "⏰",
              title: "Auto-Publishing",
              desc: "Schedule and publish across all 9 platforms simultaneously. Set it and forget it.",
              color: "#10b981",
            },
            {
              icon: "🎨",
              title: "Brand Voice Kit",
              desc: "Define your tone, vocabulary, and style once. SIGNAL applies it consistently across every post.",
              color: "#ec4899",
            },
            {
              icon: "📊",
              title: "Real-Time Analytics",
              desc: "Track reach, engagement, and ROI across all platforms in one unified dashboard.",
              color: "#f97316",
            },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className="glass" style={{
              padding: 24, border: `1px solid rgba(255,255,255,.06)`,
              transition: "border-color .2s, transform .2s",
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = `${color}40`;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(255,255,255,.06)";
                el.style.transform = "";
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 10, color: "#e2e8f0" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ PRICING ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="pill" style={{ marginBottom: 16 }}>PRICING</div>
          <h2 className="sec-head">Simple, transparent pricing</h2>
          <p className="sec-sub" style={{ margin: "16px auto 24px" }}>
            Start free for 14 days. No credit card required.
          </p>

          {/* Billing toggle */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "#090d1a", border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 999, padding: "6px 8px",
          }}>
            <button onClick={() => setAnnual(false)} style={{
              padding: "7px 18px", borderRadius: 999, border: "none",
              background: !annual ? "rgba(6,182,212,.15)" : "transparent",
              color: !annual ? "#06b6d4" : "#4a5568",
              fontSize: 12, fontFamily: "'DM Mono',monospace", letterSpacing: 1,
              transition: "all .2s",
            }}>Monthly</button>
            <button onClick={() => setAnnual(true)} style={{
              padding: "7px 18px", borderRadius: 999, border: "none",
              background: annual ? "rgba(6,182,212,.15)" : "transparent",
              color: annual ? "#06b6d4" : "#4a5568",
              fontSize: 12, fontFamily: "'DM Mono',monospace", letterSpacing: 1,
              transition: "all .2s",
            }}>Annual <span style={{ fontSize: 10, color: "#10b981" }}>-20%</span></button>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}>
          {TIERS.map((tier) => (
            <div key={tier.name} style={{
              background: tier.highlight ? "rgba(6,182,212,.06)" : "var(--card)",
              border: `1px solid ${tier.highlight ? "rgba(6,182,212,.4)" : "rgba(255,255,255,.06)"}`,
              borderRadius: 16, padding: 28,
              position: "relative",
              boxShadow: tier.highlight ? "0 0 40px rgba(6,182,212,.12)" : "none",
            }}>
              {tier.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--grad)", color: "#fff",
                  fontSize: 10, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5,
                  padding: "3px 14px", borderRadius: 999,
                }}>MOST POPULAR</div>
              )}

              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{tier.name}</div>
              <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 20, fontFamily: "'DM Mono',monospace" }}>{tier.tagline}</div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 42 }}>
                  {tier.price.monthly === 0 ? "$0" : `$${annual ? tier.price.annual : tier.price.monthly}`}
                </span>
                <span style={{ fontSize: 13, color: "#4a5568", marginLeft: 4 }}>
                  {tier.price.monthly === 0 ? "forever" : "/mo"}
                </span>
              </div>

              <Link href="/sign-up" className="cta-btn" style={{
                display: "block", textAlign: "center", width: "100%",
                padding: "11px 0", fontSize: 12, letterSpacing: 1, marginBottom: 24,
                background: tier.highlight ? "var(--grad)" : "transparent",
                border: tier.highlight ? "none" : "1px solid rgba(255,255,255,.12)",
                color: tier.highlight ? "#fff" : "#94a3b8",
                borderRadius: 10,
              }}>
                {tier.price.monthly === 0 ? "Get started free" : "Start free trial"}
              </Link>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                    <span style={{ color: "#06b6d4", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ════ TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="pill" style={{ marginBottom: 16 }}>TESTIMONIALS</div>
          <h2 className="sec-head">Loved by 2,400+ brands</h2>
        </div>

        <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass" style={{ padding: 24 }}>
              <div style={{ fontSize: 20, color: "#f59e0b", marginBottom: 12 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                “{t.quote}”
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg,#0891b2,#0e7490)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono',monospace" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: "80px 40px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="pill" style={{ marginBottom: 16 }}>FAQ</div>
          <h2 className="sec-head">Common questions</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{
                background: "var(--card)", border: `1px solid ${isOpen ? "rgba(6,182,212,.3)" : "rgba(255,255,255,.06)"}`,
                borderRadius: 12, overflow: "hidden", transition: "border-color .2s",
              }}>
                <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                  width: "100%", padding: "18px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: "none", background: "transparent",
                  textAlign: "left", color: "#e2e8f0", fontSize: 14,
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
                }}>
                  {faq.q}
                  <span style={{
                    fontSize: 20, color: "#06b6d4", transform: isOpen ? "rotate(45deg)" : "none",
                    transition: "transform .2s", flexShrink: 0, marginLeft: 12,
                  }}>+</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 20px 18px", fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ════ CTA BANNER ════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 40px", textAlign: "center",
        background: "linear-gradient(135deg, rgba(8,145,178,.12), rgba(14,116,144,.08))",
        borderTop: "1px solid rgba(6,182,212,.12)",
        borderBottom: "1px solid rgba(6,182,212,.12)",
      }}>
        <div className="pill" style={{ marginBottom: 20 }}>GET STARTED TODAY</div>
        <h2 className="sec-head" style={{ marginBottom: 16 }}>Ready to dominate your feeds?</h2>
        <p className="sec-sub" style={{ margin: "0 auto 32px" }}>
          Join 2,400+ brands already using SIGNAL to outpace their competition every single day.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/sign-up" className="cta-btn">Start free — 14 days</Link>
          <button className="ghost-btn" onClick={() => document.querySelector("#faq")?.scrollIntoView({ behavior: "smooth" })}>Learn more</button>
        </div>
      </section>

      {/* ════ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer style={{ padding: "60px 40px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="footer-grid" style={{
          display: "grid", gridTemplateColumns: "2fr repeat(4,1fr)", gap: 40, marginBottom: 48,
        }}>
          {/* Brand column */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
              SIGNAL<span style={{ color: "#06b6d4" }}>.</span>
            </div>
            <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7, maxWidth: 220 }}>
              The AI-powered social media platform for brands that want to move faster than the algorithm.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#2d3748", letterSpacing: 2, marginBottom: 16 }}>
                {col.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((t) => (
                  <a key={t.label} href={t.href} onClick={(e) => { if (t.href.startsWith("#")) { e.preventDefault(); const el = document.querySelector(t.href); if (el) el.scrollIntoView({ behavior: "smooth" }); } }} style={{ fontSize: 12, fontWeight: 400, color: "var(--dim)", transition: "color .2s", textDecoration: "none" }}>{t.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,.06)",
          paddingTop: 24, display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 12, color: "#2d3748", fontFamily: "'DM Mono',monospace" }}>
            © 2026 SIGNAL. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ label: "Privacy", href: "#hero" }, { label: "Terms", href: "#hero" }, { label: "Cookies", href: "#hero" }].map((t) => (
              <a key={t.label} href={t.href} style={{ fontSize: 12, fontWeight: 400, color: "var(--dim)", transition: "color .2s", textDecoration: "none" }}>{t.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
