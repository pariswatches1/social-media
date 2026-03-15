"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ── NAV DROPDOWN DATA ──────────────────────────────── */
const PLATFORM_LINKS: { num: string; title: string; sub: string; href: string }[] = [
  { num: "01", title: "Competitor Analysis", sub: "Reverse-engineer any competitor's content", href: "#features" },
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
  { quote: "SIGNAL tripled our engagement in 6 weeks. The virality scorer alone is worth every penny.", name: "Priya M.", role: "Head of Social", company: "Luxe Brands", avatar: "P", img: "/testimonial-sarah-opt.webp" },
  { quote: "Finally an AI tool that sounds like us, not a robot. Our content feels authentic and still gets results.", name: "Jake R.", role: "Founder", company: "GrowthLab", avatar: "J", img: "/testimonial-marcus-opt.webp" },
  { quote: "The competitor analysis feature revealed gaps we had no idea existed. Total game-changer.", name: "Sofia K.", role: "CMO", company: "NovaTech", avatar: "S", img: "/testimonial-emily-opt.webp" },
  { quote: "We went from posting twice a week to every day across 5 platforms. No extra headcount.", name: "Marcus T.", role: "VP Marketing", company: "UrbanEdge", avatar: "M", img: "/testimonial-james-opt.webp" },
];

/* ── FAQs ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q: "Can I try SIGNAL for free?", a: "Yes — we offer a 14-day free trial on all plans. No credit card required." },
  { q: "How does AI content generation work?", a: "SIGNAL's AI studies your brand voice, past performance, and competitor gaps to generate on-brand content. Each topic gets 3 angle-tested variations." },
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
    { label: "About", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Free Tools", href: "/tools" },
    { label: "Compare", href: "/compare/signal-vs-sprout-social" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/privacy#cookies" },
    { label: "GDPR", href: "/privacy#gdpr" },
  ],
  Support: [
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "mailto:support@influencccer.com" },
    { label: "Sign Up", href: "/sign-up" },
    { label: "Sign In", href: "/sign-in" },
  ],
};

/* ── FEATURES DATA ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3-3-3c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/><path d="M8 21h8"/></svg>,
    title: "AI Content Generation",
    desc: "Generate 3 angle-tested post variations per topic, trained on your brand voice and top-performing content.",
    color: "#06b6d4",
    img: "/feat-ai-content-v2-opt.webp",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M8 8h6M8 11h4"/></svg>,
    title: "Competitor Analysis",
    desc: "Reverse-engineer any competitor's top content. Find the gaps they're missing and own them.",
    color: "#8b5cf6",
    img: "/feat-competitor-v2-opt.webp",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: "Virality Scoring",
    desc: "Score every post before publishing with our proprietary algorithm trained on 47M+ posts.",
    color: "#f59e0b",
    img: "/feat-virality-v2-opt.webp",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
    title: "Auto-Publishing",
    desc: "Schedule and publish across all 9 platforms simultaneously. Set it and forget it.",
    color: "#10b981",
    img: "/feat-autopublish-v2-opt.webp",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>,
    title: "Brand Voice Kit",
    desc: "Define your tone, vocabulary, and style once. SIGNAL applies it consistently across every post.",
    color: "#ec4899",
    img: "/feat-brandvoice-v2-opt.webp",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    title: "Real-Time Analytics",
    desc: "Track reach, engagement, and ROI across all platforms in one unified dashboard.",
    color: "#f97316",
    img: "/feat-analytics-v2-opt.webp",
  },
];

/* ── TRUSTED BY LOGOS ──────────────────────────────────── */
const TRUST_LOGOS = [
  { name: "TechCrunch", width: 120 },
  { name: "Forbes", width: 80 },
  { name: "Product Hunt", width: 115 },
  { name: "Shopify", width: 90 },
  { name: "HubSpot", width: 90 },
];

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
        @keyframes float    { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        .anim-fadeUp  { animation: fadeUp .7s ease both }
        .anim-fadeIn  { animation: fadeIn .5s ease both }
        .d1 { animation-delay:.1s } .d2 { animation-delay:.2s }
        .d3 { animation-delay:.3s } .d4 { animation-delay:.4s }
        .d5 { animation-delay:.5s }
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
          .stats-row { flex-direction: column !important; gap: 16px !important; }
          .nav-right { display: none !important; }
          .hero-split { flex-direction: column !important; text-align: center !important; }
          .hero-image { margin-top: 32px !important; }
          .hero-cta-row { justify-content: center !important; }
          .hero-email-row { justify-content: center !important; }
          .hero-proof-row { justify-content: center !important; }
          .platform-flow { flex-direction: column !important; }
          .platform-flow-arrow { transform: rotate(90deg) !important; }
          .cta-inner { flex-direction: column !important; text-align: center !important; }
          .cta-inner > div:last-child { display: none !important; }
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
        padding: "120px 24px 60px", position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,.10) 0%, transparent 70%)",
          top: "5%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none",
        }} />
        {/* Secondary glow */}
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(8,145,178,.08) 0%, transparent 70%)",
          bottom: "10%", right: "10%", pointerEvents: "none",
        }} />

        <div className="hero-split" style={{
          display: "flex", alignItems: "center", gap: 56, maxWidth: 1200, width: "100%",
        }}>
          {/* Left: Text content */}
          <div style={{ flex: "1 1 48%", textAlign: "left" }}>
            <div className="pill anim-fadeIn" style={{ marginBottom: 24 }}>
              ✨ AI-Powered Social Media Intelligence
            </div>

            <h1 className="anim-fadeUp" style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 900,
              fontSize: "clamp(32px,5vw,60px)", lineHeight: 1.05,
              letterSpacing: "-1.5px", marginBottom: 20,
            }}>
              Dominate every feed with
              <span style={{
                background: "linear-gradient(135deg,#06b6d4,#0ea5e9,#38bdf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}> AI-crafted content</span>
            </h1>

            <p className="anim-fadeUp d1" style={{
              fontSize: "clamp(15px,2vw,17px)", color: "#64748b", lineHeight: 1.7,
              maxWidth: 500, marginBottom: 28,
            }}>
              SIGNAL analyses competitors, generates on-brand posts, scores virality,
              and auto-publishes across 9 platforms — so you show up everywhere, every day.
            </p>

            {/* CTA row */}
            <div className="anim-fadeUp d2 hero-cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <Link href="/sign-up" className="cta-btn">
                Start free — 14-day trial
              </Link>
              <button className="ghost-btn" onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}>
                Explore features ↓
              </button>
            </div>

            <p className="anim-fadeUp d3" style={{ fontSize: 12, color: "#2d3748", letterSpacing: ".5px", fontFamily: "'DM Mono',monospace", marginBottom: 24 }}>
              No credit card required · Cancel any time
            </p>

            {/* Email capture */}
            <div className="anim-fadeUp d4 hero-email-row" style={{
              display: "flex", gap: 10, width: "100%", maxWidth: 460, flexWrap: "wrap",
            }}>
              <input ref={emailRef} className="hero-input" placeholder="Enter your work email" type="email" onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()} />
              <button className="cta-btn" onClick={handleEmailSubmit} style={{ whiteSpace: "nowrap", padding: "14px 24px" }}>
                {emailSubmitted ? "Thank you!" : "Get early access"}
              </button>
            </div>
          </div>

          {/* Right: Hero product image — premium treatment */}
          <div className="hero-image anim-fadeUp d2" style={{
            flex: "1 1 52%", position: "relative",
          }}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(6,182,212,.20)",
              boxShadow: "0 25px 80px rgba(6,182,212,.12), 0 0 0 1px rgba(6,182,212,.05), 0 4px 20px rgba(0,0,0,.4)",
              transform: "perspective(1200px) rotateY(-2deg) rotateX(1deg)",
              transition: "transform .4s ease, box-shadow .4s ease",
            }}>
              <img
                src="/hero-dashboard-v2-opt.webp"
                alt="SIGNAL AI Dashboard — content creation, virality scoring, analytics, and multi-platform publishing"
                width={700} height={394}
                style={{ width: "100%", height: "auto", display: "block" }}
                loading="eager"
              />
            </div>
            {/* Glow behind image */}
            <div style={{
              position: "absolute", inset: -60, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6,182,212,.06) 0%, transparent 70%)",
              zIndex: -1, pointerEvents: "none",
            }} />
          </div>
        </div>

        {/* ── SOCIAL PROOF STATS — premium ── */}
        <div className="anim-fadeUp d4" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, marginTop: 56, width: "100%", maxWidth: 860,
        }}>
          <div className="stats-row" style={{
            display: "flex", alignItems: "stretch", gap: 0, width: "100%",
            background: "linear-gradient(135deg, rgba(9,13,26,.95), rgba(6,182,212,.03))",
            border: "1px solid rgba(6,182,212,.15)",
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)",
          }}>
            {[
              { val: "2,400+", label: "Active brands", sub: "and growing weekly", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { val: "47M+", label: "Posts analysed", sub: "across 9 platforms", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
              { val: "3.2×", label: "Avg. engagement lift", sub: "vs. manual posting", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg> },
              { val: "4.9", label: "Average rating", sub: "", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, suffix: <span style={{ display: "inline-flex", gap: 2, marginLeft: 6 }}>{[1,2,3,4,5].map(s => <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= 4 ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</span> },
            ].map(({ val, label, sub, icon, suffix }, i) => (
              <div key={val} style={{
                flex: 1, padding: "28px 20px", textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(6,182,212,.08)" : "none",
                transition: "background .2s",
                position: "relative",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(6,182,212,.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(6,182,212,.08)", border: "1px solid rgba(6,182,212,.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>{icon}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: "#e2e8f0", letterSpacing: "-0.5px" }}>{val}</span>
                  {suffix}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: 0.3, marginBottom: 2 }}>{label}</div>
                {sub && <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>{sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* As seen in — premium editorial strip */}
        <div className="anim-fadeUp d4" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, marginTop: 28,
          maxWidth: 860,
          position: "relative",
        }}>
          {/* Fade edges */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(90deg, #050811, transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(270deg, #050811, transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{
            display: "flex", alignItems: "center", gap: 0, width: "100%",
            padding: "18px 32px",
            background: "rgba(9,13,26,.5)", border: "1px solid rgba(255,255,255,.04)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#2d3748", letterSpacing: 2.5, whiteSpace: "nowrap", flexShrink: 0, textTransform: "uppercase" }}>As seen in</span>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.06)", margin: "0 24px", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 36, flex: 1, justifyContent: "space-between" }}>
              {TRUST_LOGOS.map((logo) => (
                <span key={logo.name} style={{
                  fontSize: 16, fontFamily: "'Syne',sans-serif", fontWeight: 800,
                  color: "#334155", letterSpacing: logo.name === "Forbes" ? 2 : 0.5,
                  textTransform: logo.name === "Forbes" ? "uppercase" : "none",
                  transition: "color .25s",
                  whiteSpace: "nowrap",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
                >{logo.name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ SUPPORTED PLATFORMS — premium visual showcase ════════════════════ */}
      <section id="platforms" style={{ padding: "100px 40px 120px", maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        {/* Ambient glow behind section */}
        <div style={{
          position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(6,182,212,.04) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="pill" style={{ marginBottom: 16 }}>MULTI-PLATFORM</div>
            <h2 className="sec-head" style={{ marginBottom: 12 }}>One dashboard. Nine platforms.</h2>
            <p className="sec-sub" style={{ margin: "0 auto" }}>
              Write once, publish everywhere. SIGNAL adapts your content to each platform’s format, tone, and audience automatically.
            </p>
          </div>

          {/* ── Central hub + radiating platforms visual ── */}
          <div className="platform-flow" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 48, marginBottom: 0,
          }}>
            {/* SIGNAL Hub — elevated command center */}
            <div style={{
              background: "linear-gradient(135deg, rgba(6,182,212,.08), rgba(6,182,212,.02))",
              border: "1px solid rgba(6,182,212,.3)",
              borderRadius: 28, padding: "36px 44px", textAlign: "center",
              boxShadow: "0 0 100px rgba(6,182,212,.1), 0 20px 60px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)",
              minWidth: 220, position: "relative",
            }}>
              {/* Glow ring */}
              <div style={{
                position: "absolute", inset: -2, borderRadius: 30,
                background: "linear-gradient(135deg, rgba(6,182,212,.2), transparent 40%, transparent 60%, rgba(6,182,212,.12))",
                zIndex: -1, filter: "blur(1px)", opacity: 0.7,
              }} />
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(135deg, #0891b2, #0e7490)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(8,145,178,.4)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#e2e8f0", marginBottom: 6 }}>SIGNAL</div>
              <div style={{ fontSize: 9, color: "#06b6d4", fontFamily: "'DM Mono',monospace", letterSpacing: 2, textTransform: "uppercase" }}>Command Center</div>
              {/* Live pulse dot */}
              <div style={{
                position: "absolute", top: 16, right: 16,
                width: 8, height: 8, borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16,185,129,.6)",
                animation: "pulse 2s ease infinite",
              }} />
            </div>

            {/* Animated connector */}
            <div className="platform-flow-arrow" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
                <path d="M0 12h86" stroke="url(#arrowGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.2s" repeatCount="indefinite"/>
                </path>
                <path d="M82 6l10 6-10 6" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                <defs><linearGradient id="arrowGrad" x1="0" y1="12" x2="100" y2="12"><stop offset="0%" stopColor="#0891b2" stopOpacity="0.2"/><stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9"/></linearGradient></defs>
              </svg>
              <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#0891b2", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Auto-publish</span>
            </div>

            {/* Platform grid — large branded cards */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
            }}>
              {PLATFORMS.map((p) => (
                <div key={p.name} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "16px 20px", cursor: "default",
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  borderRadius: 16,
                  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                  minWidth: 160, position: "relative",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.03)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${p.a20}, 0 0 0 1px ${p.border}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  }}
                >
                  {/* Live indicator dot */}
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    width: 5, height: 5, borderRadius: "50%",
                    background: p.color, opacity: 0.5,
                  }} />
                  <div style={{ flexShrink: 0, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.icon}
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: "#e2e8f0", display: "block", lineHeight: 1.2 }}>{p.name}</span>
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: p.color, opacity: 0.8, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                      Connected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom capabilities bar */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 0, marginTop: 56,
            background: "var(--card)", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 18, overflow: "hidden",
            maxWidth: 720, margin: "56px auto 0",
          }}>
            {[
              { val: "9", label: "Platforms", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg> },
              { val: "1-click", label: "Multi-publish", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> },
              { val: "Real-time", label: "Cross-platform sync", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg> },
              { val: "Auto", label: "Format adaptation", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg> },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: "center", padding: "22px 16px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,.04)" : "none",
                transition: "background .2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(6,182,212,.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                  {s.icon}
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#06b6d4" }}>{s.val}</span>
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES — redesigned ═══════════════════════════════════════════ */}
      <section id="features" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pill" style={{ marginBottom: 16 }}>PLATFORM FEATURES</div>
          <h2 className="sec-head">Everything you need to dominate social</h2>
          <p className="sec-sub" style={{ margin: "16px auto 0" }}>
            From AI content generation to real-time analytics — SIGNAL covers the entire creator lifecycle.
          </p>
        </div>

        {/* Alternating feature rows for top 2, then grid for rest */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top 2 features as large showcases */}
          {FEATURES.slice(0, 2).map(({ icon, title, desc, color, img }, idx) => (
            <div key={title} className="glass" style={{
              display: "flex", flexDirection: idx % 2 === 0 ? "row" : "row-reverse",
              overflow: "hidden", border: "1px solid rgba(255,255,255,.06)",
              transition: "border-color .3s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.06)"; }}
            >
              <div style={{
                flex: "1 1 55%", overflow: "hidden",
                borderRight: idx % 2 === 0 ? "1px solid rgba(255,255,255,.04)" : "none",
                borderLeft: idx % 2 !== 0 ? "1px solid rgba(255,255,255,.04)" : "none",
              }}>
                <img src={img} alt={title} width={800} height={600}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              </div>
              <div style={{
                flex: "1 1 45%", padding: "48px 40px",
                display: "flex", flexDirection: "column", justifyContent: "center",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 24, color: "#e2e8f0", marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}

          {/* Bottom 4 features as grid */}
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {FEATURES.slice(2).map(({ icon, title, desc, color, img }) => (
              <div key={title} className="glass" style={{
                padding: 0, border: "1px solid rgba(255,255,255,.06)",
                transition: "border-color .2s, transform .2s",
                overflow: "hidden",
              }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${color}40`;
                  el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(255,255,255,.06)";
                  el.style.transform = "";
                }}
              >
                <div style={{
                  width: "100%", aspectRatio: "16/10", overflow: "hidden",
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                  position: "relative",
                }}>
                  <img src={img} alt={title} width={400} height={250}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                  {/* Gradient overlay at bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                    background: "linear-gradient(to top, var(--card), transparent)",
                    pointerEvents: "none",
                  }} />
                </div>
                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${color}12`, border: `1px solid ${color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>{title}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PRICING — premium differentiated ══════════════════════════════════ */}
      <section id="pricing" style={{
        padding: "100px 40px", maxWidth: 1100, margin: "0 auto",
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(6,182,212,.04) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pill" style={{ marginBottom: 16 }}>PRICING</div>
          <h2 className="sec-head">Simple, transparent pricing</h2>
          <p className="sec-sub" style={{ margin: "16px auto 12px" }}>
            Start free for 14 days. No credit card required.
          </p>
          {/* Trust micro-proof */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>Cancel anytime</span>
            </div>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.06)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>No credit card needed</span>
            </div>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.06)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>Upgrade or downgrade freely</span>
            </div>
          </div>

          {/* Billing toggle — elevated */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 0,
            background: "rgba(9,13,26,.9)", border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 999, padding: "4px",
            boxShadow: "0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03)",
          }}>
            <button onClick={() => setAnnual(false)} style={{
              padding: "10px 24px", borderRadius: 999, border: "none",
              background: !annual ? "rgba(6,182,212,.15)" : "transparent",
              color: !annual ? "#06b6d4" : "#4a5568",
              fontSize: 12, fontFamily: "'DM Mono',monospace", letterSpacing: 1,
              transition: "all .2s", fontWeight: !annual ? 600 : 400,
            }}>Monthly</button>
            <button onClick={() => setAnnual(true)} style={{
              padding: "10px 24px", borderRadius: 999, border: "none",
              background: annual ? "rgba(6,182,212,.15)" : "transparent",
              color: annual ? "#06b6d4" : "#4a5568",
              fontSize: 12, fontFamily: "'DM Mono',monospace", letterSpacing: 1,
              transition: "all .2s", fontWeight: annual ? 600 : 400,
            }}>Annual <span style={{ fontSize: 10, color: "#10b981", marginLeft: 4, fontWeight: 700 }}>Save 20%</span></button>
          </div>
        </div>

        <div className="pricing-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}>
          {TIERS.map((tier) => (
            <div key={tier.name} style={{
              background: tier.highlight
                ? "linear-gradient(180deg, rgba(6,182,212,.06) 0%, rgba(6,182,212,.02) 100%)"
                : "var(--card)",
              border: `1px solid ${tier.highlight ? "rgba(6,182,212,.35)" : "rgba(255,255,255,.06)"}`,
              borderRadius: 20, padding: "36px 26px",
              position: "relative",
              boxShadow: tier.highlight
                ? "0 0 80px rgba(6,182,212,.08), 0 24px 48px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06)"
                : "inset 0 1px 0 rgba(255,255,255,.03)",
              transition: "border-color .25s, transform .25s, box-shadow .25s",
              display: "flex", flexDirection: "column",
            }}
              onMouseEnter={(e) => {
                if (!tier.highlight) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.14)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05)";
                }
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                if (!tier.highlight) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.06)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.03)";
                }
                (e.currentTarget as HTMLDivElement).style.transform = "";
              }}
            >
              {tier.highlight && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: "var(--grad)", color: "#fff",
                  fontSize: 10, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5,
                  padding: "5px 18px", borderRadius: 999,
                  boxShadow: "0 4px 16px rgba(8,145,178,.35)",
                  fontWeight: 600,
                }}>MOST POPULAR</div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6,
                  color: tier.highlight ? "#06b6d4" : "#e2e8f0",
                }}>{tier.name}</div>
                <div style={{ fontSize: 12, color: "#4a5568", fontFamily: "'DM Mono',monospace", lineHeight: 1.5 }}>{tier.tagline}</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 42, lineHeight: 1, color: "#e2e8f0" }}>
                  {tier.price.monthly === 0 ? "$0" : `$${annual ? tier.price.annual : tier.price.monthly}`}
                </span>
                <span style={{ fontSize: 13, color: "#4a5568", marginLeft: 4 }}>
                  {tier.price.monthly === 0 ? "forever" : "/mo"}
                </span>
                {annual && tier.price.monthly > 0 && (
                  <div style={{ fontSize: 11, color: "#10b981", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>
                    ${(tier.price.monthly - tier.price.annual) * 12}/yr saved
                  </div>
                )}
              </div>

              <Link href="/sign-up" style={{
                display: "block", textAlign: "center", width: "100%",
                padding: "13px 0", fontSize: 12, letterSpacing: 1, marginBottom: 24,
                background: tier.highlight ? "var(--grad)" : "transparent",
                border: tier.highlight ? "none" : "1px solid rgba(255,255,255,.10)",
                color: tier.highlight ? "#fff" : "#94a3b8",
                borderRadius: 12, fontFamily: "'DM Mono',monospace", fontWeight: 600,
                boxShadow: tier.highlight ? "0 4px 20px rgba(8,145,178,.3)" : "none",
                transition: "all .25s",
                textDecoration: "none",
              }}
                onMouseEnter={(e) => {
                  if (!tier.highlight) {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.4)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.06)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#06b6d4";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!tier.highlight) {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.10)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                  }
                }}
              >
                {tier.price.monthly === 0 ? "Get started free" : "Start free trial"}
              </Link>

              <div style={{ borderTop: "1px solid rgba(255,255,255,.04)", paddingTop: 20, flex: 1 }}>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tier.highlight ? "#06b6d4" : "#0891b2"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        {/* Guarantee bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 40,
          padding: "20px 32px",
          background: "rgba(16,185,129,.04)", border: "1px solid rgba(16,185,129,.12)",
          borderRadius: 16,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 12 15 16 10"/>
          </svg>
          <div>
            <span style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>14-day money-back guarantee</span>
            <span style={{ fontSize: 12, color: "#4a5568", marginLeft: 8 }}>— no questions asked. If SIGNAL isn’t right for you, get a full refund.</span>
          </div>
        </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS — premium deep trust ═════════════════════ */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pill" style={{ marginBottom: 16 }}>TESTIMONIALS</div>
          <h2 className="sec-head">Loved by 2,400+ brands</h2>
          <p className="sec-sub" style={{ margin: "12px auto 0" }}>See why top creators and agencies choose SIGNAL to power their social strategy.</p>
          {/* Aggregate rating bar */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12, marginTop: 20,
            padding: "10px 24px",
            background: "rgba(245,158,11,.04)", border: "1px solid rgba(245,158,11,.12)",
            borderRadius: 999,
          }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= 4 ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span style={{ fontSize: 13, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#f59e0b" }}>4.9</span>
            <div style={{ width: 1, height: 14, background: "rgba(245,158,11,.15)" }} />
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>Based on 340+ reviews</span>
          </div>
        </div>

        {/* Featured testimonial — first one gets prominence */}
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,.05), rgba(6,182,212,.01))",
          border: "1px solid rgba(6,182,212,.2)",
          borderRadius: 24, padding: "40px 44px",
          marginBottom: 20,
          position: "relative",
          boxShadow: "0 8px 40px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.04)",
        }}>
          {/* Large quote mark */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", top: 24, left: 32, opacity: 0.06 }}>
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="#06b6d4"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="#06b6d4"/>
          </svg>

          <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
            {[1,2,3,4,5].map((s) => (
              <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <p style={{ fontSize: 18, color: "#e2e8f0", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic", maxWidth: 700 }}>
            &ldquo;{TESTIMONIALS[0].quote}&rdquo;
          </p>
          {/* Result metric */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", marginBottom: 20,
            background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.15)",
            borderRadius: 999,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
            <span style={{ fontSize: 12, color: "#10b981", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>3× engagement increase in 6 weeks</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%", overflow: "hidden",
              border: "2px solid rgba(6,182,212,.3)",
              boxShadow: "0 4px 12px rgba(0,0,0,.3)",
              flexShrink: 0,
            }}>
              <img src={TESTIMONIALS[0].img} alt={TESTIMONIALS[0].name} width={52} height={52}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{TESTIMONIALS[0].name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{TESTIMONIALS[0].role}</div>
              <div style={{ fontSize: 12, color: "#06b6d4", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{TESTIMONIALS[0].company}</div>
            </div>
          </div>
        </div>

        {/* Remaining testimonials grid */}
        <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {TESTIMONIALS.slice(1).map((t) => (
            <div key={t.name} style={{
              background: "var(--card)", border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 20, padding: "28px 24px",
              transition: "border-color .25s, transform .25s, box-shadow .25s",
              display: "flex", flexDirection: "column",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(6,182,212,.2)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.06)";
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.03)";
              }}
            >
              {/* Star rating */}
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16, flex: 1, fontStyle: "italic" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              {/* Result highlight */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", marginBottom: 16,
                background: "rgba(6,182,212,.04)", border: "1px solid rgba(6,182,212,.1)",
                borderRadius: 8, alignSelf: "flex-start",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 10, color: "#06b6d4", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
                  {t.company === "GrowthLab" ? "5× content output" : t.company === "NovaTech" ? "Found 12 content gaps" : "Daily posting, 0 extra hires"}
                </span>
              </div>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid rgba(255,255,255,.04)", paddingTop: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", overflow: "hidden",
                  border: "2px solid rgba(6,182,212,.2)",
                  flexShrink: 0,
                }}>
                  <img src={t.img} alt={t.name} width={40} height={40}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{t.role}</div>
                  <div style={{ fontSize: 10, color: "#06b6d4", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust company bar — enriched */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, marginTop: 48,
          background: "var(--card)", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{
            padding: "18px 24px", borderRight: "1px solid rgba(255,255,255,.04)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#4a5568", letterSpacing: 2 }}>TRUSTED BY</span>
            <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#2d3748", letterSpacing: 1 }}>TEAMS AT</span>
          </div>
          {["Luxe Brands", "GrowthLab", "NovaTech", "UrbanEdge"].map((co, i) => (
            <div key={co} style={{
              flex: 1, textAlign: "center", padding: "16px 20px",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,.04)" : "none",
              transition: "background .2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(6,182,212,.03)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <span style={{
                fontSize: 15, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                color: "#475569", letterSpacing: 0.3,
              }}>{co}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════ FAQ — premium polish ═══════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: "100px 40px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pill" style={{ marginBottom: 16 }}>FAQ</div>
          <h2 className="sec-head">Common questions</h2>
          <p className="sec-sub" style={{ margin: "12px auto 0" }}>Everything you need to know about SIGNAL.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{
                background: isOpen
                  ? "linear-gradient(135deg, rgba(6,182,212,.04), rgba(6,182,212,.01))"
                  : "var(--card)",
                border: `1px solid ${isOpen ? "rgba(6,182,212,.25)" : "rgba(255,255,255,.06)"}`,
                borderRadius: 16, overflow: "hidden",
                transition: "border-color .25s, background .25s, box-shadow .25s",
                boxShadow: isOpen
                  ? "0 8px 32px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.04)"
                  : "inset 0 1px 0 rgba(255,255,255,.03)",
              }}>
                <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                  width: "100%", padding: "22px 28px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: "none", background: "transparent",
                  textAlign: "left", color: isOpen ? "#e2e8f0" : "#94a3b8", fontSize: 15,
                  fontFamily: "'DM Sans',sans-serif", fontWeight: isOpen ? 600 : 500,
                  transition: "color .2s",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: isOpen ? "rgba(6,182,212,.12)" : "rgba(255,255,255,.03)",
                      border: `1px solid ${isOpen ? "rgba(6,182,212,.2)" : "rgba(255,255,255,.06)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontFamily: "'DM Mono',monospace",
                      color: isOpen ? "#06b6d4" : "#4a5568",
                      flexShrink: 0,
                      transition: "all .2s",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {faq.q}
                  </span>
                  <span style={{
                    width: 30, height: 30, borderRadius: 10,
                    background: isOpen ? "rgba(6,182,212,.15)" : "rgba(255,255,255,.04)",
                    border: `1px solid ${isOpen ? "rgba(6,182,212,.2)" : "rgba(255,255,255,.06)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 16,
                    transition: "all .25s",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "#06b6d4" : "#64748b"} strokeWidth="2" strokeLinecap="round"
                      style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .25s" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: "0 28px 24px 64px", fontSize: 14, color: "#64748b", lineHeight: 1.8,
                    borderTop: "1px solid rgba(255,255,255,.04)", marginTop: 0, paddingTop: 18,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom helper link */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 13, color: "#4a5568" }}>
            Still have questions?{" "}
            <a href="mailto:support@influencccer.com" style={{
              color: "#06b6d4", textDecoration: "none",
              borderBottom: "1px solid rgba(6,182,212,.3)",
              transition: "border-color .2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(6,182,212,.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(6,182,212,.3)")}
            >Reach out to our team</a>
          </p>
        </div>
      </section>

      {/* ════ CTA BANNER — premium closing block ═════════════════════════════ */}
      <section style={{
        padding: "0 40px", maxWidth: 1200, margin: "40px auto 60px",
      }}>
        <div style={{
          borderRadius: 24, overflow: "hidden", position: "relative",
          border: "1px solid rgba(6,182,212,.15)",
          background: "linear-gradient(135deg, rgba(8,145,178,.08), rgba(14,116,144,.04))",
        }}>
          {/* CTA background visual */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0, opacity: 0.15,
            backgroundImage: "url(/cta-visual-v2-opt.webp)",
            backgroundSize: "cover", backgroundPosition: "center",
            pointerEvents: "none",
          }} />
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: "linear-gradient(135deg, rgba(5,8,17,.7) 0%, rgba(5,8,17,.3) 100%)",
            pointerEvents: "none",
          }} />

          <div className="cta-inner" style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", gap: 48,
            padding: "64px 56px",
          }}>
            <div style={{ flex: "1 1 60%" }}>
              <div className="pill" style={{ marginBottom: 20 }}>GET STARTED TODAY</div>
              <h2 style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: "clamp(24px,4vw,40px)", lineHeight: 1.1,
                letterSpacing: "-.5px", marginBottom: 16, color: "#e2e8f0",
              }}>
                Ready to dominate your feeds?
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
                Join 2,400+ brands already using SIGNAL to outpace their competition every single day.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/sign-up" className="cta-btn" style={{ padding: "14px 36px" }}>Start free — 14 days</Link>
                <button className="ghost-btn" onClick={() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" })}>View pricing</button>
              </div>
            </div>

            {/* Right: floating dashboard visual */}
            <div style={{
              flex: "1 1 40%", display: "flex", justifyContent: "center",
            }}>
              <div style={{
                borderRadius: 14, overflow: "hidden",
                border: "1px solid rgba(6,182,212,.15)",
                boxShadow: "0 20px 60px rgba(0,0,0,.4), 0 0 40px rgba(6,182,212,.06)",
                maxWidth: 360,
                animation: "float 6s ease-in-out infinite",
              }}>
                <img
                  src="/hero-dashboard-v2-opt.webp"
                  alt="SIGNAL Dashboard preview"
                  width={360} height={200}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FOOTER — premium polish ═════════════════════════════════════════ */}
      <footer style={{
        padding: "72px 40px 36px", maxWidth: 1100, margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}>
        <div className="footer-grid" style={{
          display: "grid", gridTemplateColumns: "2fr repeat(4,1fr)", gap: 48, marginBottom: 56,
        }}>
          {/* Brand column */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 14, letterSpacing: "-0.5px" }}>
              SIGNAL<span style={{ color: "#06b6d4" }}>.</span>
            </div>
            <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.8, maxWidth: 240, marginBottom: 24 }}>
              The AI-powered social media platform for brands that want to move faster than the algorithm.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: "#", label: "Twitter", path: "M4 4l6.5 7.5L4 20h2.5l5.2-6 4.8 6H20l-7-8.5L19.5 4H17l-4.8 5.5L7.5 4H4z" },
                { href: "#", label: "LinkedIn", path: "M7 10v7M7 7.5v.5M11 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M11 10v7" },
                { href: "#", label: "Instagram", path: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM17.5 6.5h.01" },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color .25s, background .25s",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.3)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.06)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.04)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#4a5568", letterSpacing: 1.5, marginBottom: 20, fontWeight: 600 }}>
                {col.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {links.map((t) => (
                  <a key={t.label} href={t.href} onClick={(e) => { if (t.href.startsWith("#")) { e.preventDefault(); const el = document.querySelector(t.href); if (el) el.scrollIntoView({ behavior: "smooth" }); } }} style={{
                    fontSize: 13, fontWeight: 400, color: "#4a5568", transition: "color .2s", textDecoration: "none",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
                  >{t.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,.06)",
          paddingTop: 28, display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 12, color: "#2d3748", fontFamily: "'DM Mono',monospace" }}>
            &copy; 2026 SIGNAL. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Cookies", href: "/privacy#cookies" }].map((t) => (
              <a key={t.label} href={t.href} style={{ fontSize: 12, fontWeight: 400, color: "#2d3748", transition: "color .2s", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4a5568")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2d3748")}
              >{t.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
