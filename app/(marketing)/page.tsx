"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ── NAV DROPDOWN DATA ──────────────────────────────── */
const PLATFORM_LINKS = [
  { num: "01", title: "Competitor Analysis", sub: "Reverse-engineer any competitor\u2019s content" },
  { num: "02", title: "AI Generation", sub: "3 angle-tested variations per topic" },
  { num: "03", title: "Virality Scoring", sub: "Score every post before it goes live" },
];
const SOLUTIONS_LINKS = [
  { num: "01", title: "Brand Voice Kit", sub: "Define and apply your brand voice at scale" },
  { num: "02", title: "Content Calendar", sub: "Visual month/week planner for all platforms" },
  { num: "03", title: "Auto-Publishing", sub: "Connect 7 platforms, publish automatically" },
  { num: "04", title: "SIGNAL Inbox", sub: "Your content activity hub" },
  { num: "05", title: "Content Library", sub: "Save, search, export, import content" },
  { num: "06", title: "Analytics", sub: "Track performance across all platforms" },
];

/* ── PLATFORM CARDS DATA ──────────────────────────────── */
const PLATFORMS = [
  { name: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,.08)", border: "rgba(225,48,108,.30)", a08: "rgba(225,48,108,.12)", a20: "rgba(225,48,108,.22)", delay: "d1", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#E1306C" strokeWidth="1.6"/><circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="1.6"/><circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/></svg> },
  { name: "LinkedIn", color: "#0A66C2", bg: "rgba(10,102,194,.08)", border: "rgba(10,102,194,.30)", a08: "rgba(10,102,194,.12)", a20: "rgba(10,102,194,.22)", delay: "d1", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3.5" stroke="#0A66C2" strokeWidth="1.6"/><path d="M7 10v7M7 7.5v.5M11 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M11 10v7" stroke="#0A66C2" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { name: "X / Twitter", color: "#e7e9ea", bg: "rgba(231,233,234,.06)", border: "rgba(231,233,234,.28)", a08: "rgba(231,233,234,.09)", a20: "rgba(231,233,234,.16)", delay: "d2", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 7.5L4 20h2.5l5.2-6 4.8 6H20l-7-8.5L19.5 4H17l-4.8 5.5L7.5 4H4z" fill="#e7e9ea"/></svg> },
  { name: "TikTok", color: "#FF0050", bg: "rgba(255,0,80,.08)", border: "rgba(255,0,80,.30)", a08: "rgba(255,0,80,.12)", a20: "rgba(255,0,80,.22)", delay: "d2", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M9 12a4 4 0 1 0 4 4V4c.5 2 2.5 4 5 4" stroke="#FF0050" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: "Reddit", color: "#FF4500", bg: "rgba(255,69,0,.08)", border: "rgba(255,69,0,.30)", a08: "rgba(255,69,0,.12)", a20: "rgba(255,69,0,.22)", delay: "d3", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#FF4500" strokeWidth="1.6"/><path d="M16.5 10a2 2 0 0 1 2 2c0 .8-.5 1.5-1.2 1.8.1.3.1.6.1.9 0 2.2-2.4 4-5.4 4s-5.4-1.8-5.4-4c0-.3 0-.6.1-.9A2 2 0 1 1 10.2 10M9 13.5c0 .6.4 1 1 1M14 13.5c0 .6.4 1 1 1" stroke="#FF4500" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { name: "Facebook", color: "#1877F2", bg: "rgba(24,119,242,.08)", border: "rgba(24,119,242,.30)", a08: "rgba(24,119,242,.12)", a20: "rgba(24,119,242,.22)", delay: "d3", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#1877F2" strokeWidth="1.6"/><path d="M13 21.5V14h2.5l.5-2.5H13v-1.5c0-.7.3-1 1-1h2V7s-.9-.2-2-.2c-2.3 0-3.5 1.4-3.5 3.5V11.5H8V14h2.5v7.5" stroke="#1877F2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: "Snapchat", color: "#FFFC00", bg: "rgba(255,252,0,.06)", border: "rgba(255,252,0,.26)", a08: "rgba(255,252,0,.09)", a20: "rgba(255,252,0,.16)", delay: "d4", icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 3c-2.8 0-5 2.2-5 5v2.5c-.5.5-1.5.5-2 1 0 .7.5 1 1 1.2-.3.6-.8 1.3-2 1.5.3.5 1.5.8 2.5.9.2.5.5 1 .5 1 .2.3.5.5.8.4 1.2 0 2 .5 4.2.5s3-.5 4.2-.5c.3.1.6-.1.8-.4 0 0 .3-.5.5-1 1-.1 2.2-.4 2.5-.9-1.2-.2-1.7-.9-2-1.5.5-.2 1-.5 1-1.2-.5-.5-1.5-.5-2-1V8c0-2.8-2.2-5-5-5z" stroke="#FFFC00" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
];

/* ── HOW IT WORKS CARDS ──────────────────────────────── */
const HOW_CARDS = [
  { num: "01 \u2014 Analyze", title: "Competitor\nIntelligence", desc: "Paste any URL. Get a full breakdown: hook structure, emotional triggers, timing, CTA strength \u2014 plus a blueprint to replicate it." },
  { num: "02 \u2014 Generate", title: "AI Content\nGeneration", desc: "Three variations per topic \u2014 authority, curiosity, relatability \u2014 each scored for virality before you see it." },
  { num: "03 \u2014 Publish", title: "Smart\nScheduling", desc: "SIGNAL knows when each platform rewards engagement. Schedule manually or let the auto-publisher handle it." },
];

/* ── SERVICE PANELS ──────────────────────────────────── */
const SERVICES = [
  {
    num: "01", label: "Competitor intelligence",
    desc: "Paste any competitor post, profile, or campaign URL. SIGNAL dissects what made it perform \u2014 hook structure, emotional trigger, timing signal, CTA architecture \u2014 and returns a precise blueprint for you to replicate and surpass it.",
    cta1: "Explore", cta2: "Start analyzing",
    headTop: "INTELLI", headBot: "GENCE.", headAccent: false,
    tags: "Analyze \u00b7 Reverse-engineer \u00b7 Blueprint",
    footCta: "Start analyzing \u2192",
  },
  {
    num: "02", label: "AI content generation",
    desc: "Not one post. Three. Every topic gets three variations \u2014 an authority angle, a curiosity angle, a relatability angle \u2014 each adapted for your target platform\u2019s character limits, tone norms, and engagement patterns. Each scored for virality before you see it.",
    cta1: "Explore", cta2: "Start generating",
    headTop: "CREAT", headBot: "ION.", headAccent: true,
    tags: "Authority \u00b7 Curiosity \u00b7 Relatability",
    footCta: "Start generating \u2192",
  },
  {
    num: "03", label: "Auto-publishing",
    desc: "Accompanying your content from draft to live \u2014 across 7 platforms simultaneously. SIGNAL knows the exact window each algorithm rewards. Schedule manually, or connect your accounts and let SIGNAL publish at peak engagement, automatically.",
    cta1: "Explore", cta2: "View all platforms",
    headTop: "EXECU", headBot: "TION.", headAccent: false,
    tags: "Schedule \u00b7 Auto-publish \u00b7 Optimize",
    footCta: "View all platforms \u2192",
  },
];

/* ── POSTURE COLS ──────────────────────────────────── */
const POSTURE = [
  { accent: "Data-driven", rest: "by design", body: "Every recommendation SIGNAL makes is backed by pattern recognition across millions of posts. Virality isn\u2019t random \u2014 it follows structures. We find them before you post." },
  { accent: "AI-native", rest: "not AI-bolted-on", body: "Built from the ground up on Claude. Not a chatbot wrapper, not a template system. Genuine intelligence applied to every stage of your content workflow." },
  { accent: "Platform-aware", rest: "not platform-agnostic", body: "Instagram, LinkedIn, X, TikTok, Reddit, Facebook, Snapchat. Each has its own language, cadence, and algorithm. SIGNAL speaks all seven fluently." },
  { accent: "Ruthlessly", rest: "simple pricing", body: "Sprout Social charges $299/month. We start at $79.99. Not a stripped-down version \u2014 the same core intelligence, fraction of the spend, zero lock-in." },
];

/* ── CASES ──────────────────────────────────────────── */
const CASES = [
  { wm: "Horizon", cat: "SaaS \u00b7 LinkedIn + Instagram", title: "Horizon", sub: "B2B SaaS team with no dedicated social manager. Used SIGNAL to systematically reverse-engineer competitors and generate content weekly across two platforms.", pill: "+340% engagement", rl: "in 60 days" },
  { wm: "HAUS", cat: "Agency \u00b7 8 clients \u00b7 All platforms", title: "HAUS Agency", sub: "Social media agency managing 8 clients on Sprout Social. Migrated all 8 to SIGNAL Agency plan. Same capabilities, fraction of the cost, zero features lost.", pill: "$2,400 \u2192 $79/mo", rl: "per month" },
  { wm: "MV", cat: "Founder \u00b7 X / Twitter + LinkedIn", title: "Marco Vitale", sub: "Solo founder with zero marketing background. Used SIGNAL to identify what content formats were working in his niche and generate daily variations automatically.", pill: "0 \u2192 10K followers", rl: "in 90 days" },
];

/* ── MARQUEE ITEMS ──────────────────────────────────── */
const MQ_ROW_A = [
  { text: "Competitor Intel", lit: true }, { text: "Virality Scoring", lit: false },
  { text: "A/B/C Variations", lit: true }, { text: "Brand Voice Kit", lit: false },
  { text: "Content Calendar", lit: true }, { text: "Auto-Publishing", lit: false },
  { text: "7 Platforms", lit: true },
];
const MQ_ROW_B = [
  { text: "$79.99 / month", lit: false }, { text: "vs Sprout $299", lit: true },
  { text: "73% cheaper", lit: false }, { text: "AI-First", lit: true },
  { text: "SIGNAL the algorithm", lit: false }, { text: "Instagram \u00b7 LinkedIn \u00b7 X", lit: true },
  { text: "TikTok \u00b7 Reddit \u00b7 Facebook", lit: false },
];

/* ════════════════════════════════════════════════════════════
   INLINE STYLE CONSTANTS
   ════════════════════════════════════════════════════════════ */
const secStyle: React.CSSProperties = {
  position: "relative", zIndex: 3,
  background: "var(--glass)",
  backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
  borderBottom: "1px solid var(--glassbr)",
};
const secInner: React.CSSProperties = {
  maxWidth: "var(--wrap)", margin: "0 auto", padding: "88px var(--pad)",
};
const eyebrow: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  fontSize: 13, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ac)",
  marginBottom: 22,
};
const eyebrowBar: React.CSSProperties = { width: 26, height: 1, background: "var(--ac)", flexShrink: 0 };

/* ════════════════════════════════════════════════════════════
   COMPONENT: STL (dual-text hover animation)
   ════════════════════════════════════════════════════════════ */
function STL({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <span className="stl" style={style}>
      <span className="stli">
        <span style={style}>{text}</span>
        <span style={style}>{text}</span>
      </span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   BOLT SVG
   ════════════════════════════════════════════════════════════ */
function BoltIcon({ size = 13, fill = "#060C3D" }: { size?: number; fill?: string }) {
  return <svg viewBox="0 0 16 16" style={{ width: size }}><path d="M9.5 1L4 9h5L7.5 15L14 7h-5z" fill={fill} /></svg>;
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function MarketingPage() {
  const [openNav, setOpenNav] = useState<string | null>(null);

  /* ── Custom cursor ── */
  useEffect(() => {
    const dot = document.getElementById("cd");
    const ring = document.getElementById("cr");
    const spl = document.getElementById("spl");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
      if (spl) spl.style.background = `radial-gradient(600px at ${mx}px ${my}px, rgba(0,237,212,.07), transparent 70%)`;
    };
    const animRing = () => {
      rx += (mx - rx) * 0.10; ry += (my - ry) * 0.10;
      if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
      requestAnimationFrame(animRing);
    };
    window.addEventListener("mousemove", onMove);
    animRing();
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Cursor hover expansion ── */
  useEffect(() => {
    const add = () => document.body.classList.add("hov");
    const rem = () => document.body.classList.remove("hov");
    const els = document.querySelectorAll("a, button, .ioc, .casecard, .poscol, .platcard");
    els.forEach(el => { el.addEventListener("mouseenter", add); el.addEventListener("mouseleave", rem); });
    return () => els.forEach(el => { el.removeEventListener("mouseenter", add); el.removeEventListener("mouseleave", rem); });
  }, []);

  /* ── Nav scroll background ── */
  useEffect(() => {
    const nav = document.getElementById("signal-nav");
    const check = () => nav?.classList.toggle("sc", window.scrollY > 40);
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  /* ── STL height fix ── */
  useEffect(() => {
    document.querySelectorAll(".stl").forEach((el) => {
      const sp = el.querySelector("span") as HTMLElement;
      if (!sp) return;
      const lh = parseFloat(getComputedStyle(sp).lineHeight) || parseFloat(getComputedStyle(sp).fontSize) * 1.3;
      (el as HTMLElement).style.height = Math.ceil(lh) + "px";
      (el as HTMLElement).style.lineHeight = "1";
    });
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll(".rv, .rvl, .rvr");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.06 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── Click ripple ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const d = document.createElement("div");
      d.style.cssText = `position:fixed;pointer-events:none;z-index:9997;left:${e.clientX}px;top:${e.clientY}px;width:6px;height:6px;border-radius:50%;border:1.5px solid rgba(0,237,212,.7);transform:translate(-50%,-50%);animation:ripple .75s ease-out forwards;`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 800);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* ── Dropdown brand sidebar (reused) ── */
  const ddBrand = (desc: string) => (
    <div style={{ width: 290, flexShrink: 0, borderRight: "1px solid var(--glassbr)", padding: "36px 40px", display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 14, fontWeight: 400, color: "var(--mu)", lineHeight: 1.72, marginBottom: 22, maxWidth: 210 }}>{desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <a href="#" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 400, color: "var(--dim)", transition: "color .2s" }}>
          <span>&#120143;</span><STL text="Twitter / X" style={{ fontSize: 13, fontWeight: 400, color: "inherit" }} />
        </a>
        <a href="mailto:hello@getsignal.ai" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 400, color: "var(--dim)", transition: "color .2s" }}>
          <span>&#x2709;</span><STL text="hello@getsignal.ai" style={{ fontSize: 13, fontWeight: 400, color: "inherit" }} />
        </a>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 22 }}>
        <div style={{ width: 44, height: 44, background: "var(--a06)", border: "1px solid var(--a12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 22 }}><path d="M14 2L6 13h7L11 22L19 11h-7z" fill="#00EDD4" opacity=".85" /></svg>
        </div>
      </div>
    </div>
  );

  /* ── Dropdown links grid (reused) ── */
  const ddLinksGrid = (links: typeof PLATFORM_LINKS) => (
    <div style={{ flex: 1, padding: "28px 48px", display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: 0 }}>
      {links.map(l => (
        <a key={l.num} href="#" style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 18px", borderRadius: 10, width: "calc(100%/3)", transition: "background .2s" }}
           onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
           onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "var(--ac)", opacity: .8, flexShrink: 0, marginTop: 3 }}>{l.num}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginBottom: 3 }}>{l.title}</div>
            <div style={{ fontSize: 13, fontWeight: 400, color: "var(--mu)", lineHeight: 1.5 }}>{l.sub}</div>
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <>
      {/* ══════ NAV ══════ */}
      <nav id="signal-nav" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        height: "var(--nh)", display: "flex", alignItems: "center", padding: "0 var(--pad)",
        borderBottom: "1px solid transparent",
      }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", flexShrink: 0, marginRight: 52, color: "#fff" }}>
          <div style={{ width: 28, height: 28, background: "var(--ac)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BoltIcon />
          </div>
          Signal
        </a>
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          {/* Platform dropdown */}
          <div style={{ position: "relative", height: "var(--nh)", display: "flex", alignItems: "center" }}
               onMouseEnter={() => setOpenNav("platform")} onMouseLeave={() => setOpenNav(null)}>
            <span style={{ fontSize: 15, fontWeight: 400, color: openNav === "platform" ? "#fff" : "rgba(255,255,255,.65)", padding: "0 18px", height: "100%", display: "flex", alignItems: "center", gap: 5, transition: "color .2s", whiteSpace: "nowrap", cursor: "none" }}>
              Platform <span style={{ fontSize: 8, opacity: openNav === "platform" ? 1 : .5, transition: "transform .3s, opacity .2s", transform: openNav === "platform" ? "rotate(180deg)" : "none" }}>&#9660;</span>
            </span>
            <div style={{
              position: "fixed", top: "var(--nh)", left: 0, right: 0,
              background: "rgba(4,12,52,.96)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              borderBottom: "1px solid var(--glassbr)",
              display: "flex", alignItems: "stretch",
              maxHeight: openNav === "platform" ? 300 : 0, overflow: "hidden", opacity: openNav === "platform" ? 1 : 0,
              transition: "max-height .45s cubic-bezier(.16,1,.3,1), opacity .3s ease", zIndex: 490,
            }}>
              {ddBrand("AI content intelligence platform for social teams who want to know what wins before they post.")}
              {ddLinksGrid(PLATFORM_LINKS)}
            </div>
          </div>
          {/* How it works */}
          <div style={{ position: "relative", height: "var(--nh)", display: "flex", alignItems: "center" }}>
            <a href="#intro" style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,.65)", padding: "0 18px", height: "100%", display: "flex", alignItems: "center", transition: "color .2s", whiteSpace: "nowrap" }}>How it works</a>
          </div>
          {/* Solutions dropdown */}
          <div style={{ position: "relative", height: "var(--nh)", display: "flex", alignItems: "center" }}
               onMouseEnter={() => setOpenNav("solutions")} onMouseLeave={() => setOpenNav(null)}>
            <span style={{ fontSize: 15, fontWeight: 400, color: openNav === "solutions" ? "#fff" : "rgba(255,255,255,.65)", padding: "0 18px", height: "100%", display: "flex", alignItems: "center", gap: 5, transition: "color .2s", whiteSpace: "nowrap", cursor: "none" }}>
              Solutions <span style={{ fontSize: 8, opacity: openNav === "solutions" ? 1 : .5, transition: "transform .3s, opacity .2s", transform: openNav === "solutions" ? "rotate(180deg)" : "none" }}>&#9660;</span>
            </span>
            <div style={{
              position: "fixed", top: "var(--nh)", left: 0, right: 0,
              background: "rgba(4,12,52,.96)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              borderBottom: "1px solid var(--glassbr)",
              display: "flex", alignItems: "stretch",
              maxHeight: openNav === "solutions" ? 300 : 0, overflow: "hidden", opacity: openNav === "solutions" ? 1 : 0,
              transition: "max-height .45s cubic-bezier(.16,1,.3,1), opacity .3s ease", zIndex: 490,
            }}>
              {ddBrand("Everything you need to build, schedule, and dominate your social presence across 7 platforms.")}
              {ddLinksGrid(SOLUTIONS_LINKS)}
            </div>
          </div>
          {/* Results */}
          <div style={{ position: "relative", height: "var(--nh)", display: "flex", alignItems: "center" }}>
            <a href="#cases" style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,.65)", padding: "0 18px", height: "100%", display: "flex", alignItems: "center", transition: "color .2s", whiteSpace: "nowrap" }}>Results</a>
          </div>
          {/* Free Tools */}
          <div style={{ position: "relative", height: "var(--nh)", display: "flex", alignItems: "center" }}>
            <Link href="/tools" style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,.65)", padding: "0 18px", height: "100%", display: "flex", alignItems: "center", transition: "color .2s", whiteSpace: "nowrap", textDecoration: "none" }}>Free Tools</Link>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: "auto", flexShrink: 0 }}>
          <Link href="/sign-up" style={{
            background: "#fff", borderRadius: 99, padding: "10px 24px",
            fontSize: 13, fontWeight: 700, color: "#060C3D", letterSpacing: ".04em",
            fontFamily: "var(--fd)", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "background .25s, transform .3s, box-shadow .3s",
            border: "1px solid rgba(255,255,255,.9)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--ac)"; e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(0,237,212,.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            Get started <span style={{ fontSize: 12, transition: "transform .3s" }}>&rarr;</span>
          </Link>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section id="hero" style={{
        position: "relative", height: "100vh", minHeight: 660,
        display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 3,
      }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse 62% 72% at 50% 46%, rgba(4,12,52,.60) 0%, transparent 68%), linear-gradient(to bottom, rgba(4,12,52,.25) 0%, transparent 35%, transparent 65%, rgba(4,12,52,.40) 100%)",
        }} />
        <div style={{
          position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
          padding: "calc(var(--nh) + 32px) var(--pad) 28px",
        }}>
          <div className="rv" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(4,12,52,.40)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,.22)", borderRadius: 99, padding: "6px 18px", marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ac)", boxShadow: "0 0 10px var(--ac)", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.90)" }}>AI-powered &middot; 7 platforms &middot; $79.99/mo</span>
          </div>
          <h1 className="rv d1" style={{
            fontFamily: "var(--fd)", fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 800,
            letterSpacing: "-.04em", lineHeight: .95, color: "#fff", maxWidth: 900,
            textShadow: "0 4px 52px rgba(4,12,52,.55)",
          }}>
            Discover what&apos;s working for <span style={{ color: "var(--ac)" }}>influencers</span> now.
          </h1>
          <p className="rv d2" style={{
            marginTop: 28, fontSize: 20, fontWeight: 400,
            color: "rgba(255,255,255,.82)", maxWidth: 620, lineHeight: 1.68, textAlign: "center",
          }}>
            See what top influencers are doing before everyone else catches on.
          </p>
          <div className="rv d3" style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#fff", color: "#060C3D", fontFamily: "var(--fd)", fontSize: 15, fontWeight: 700,
              letterSpacing: ".04em", padding: "16px 40px", borderRadius: 99,
              transition: "background .25s, transform .35s cubic-bezier(.16,1,.3,1), box-shadow .4s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--ac)"; e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 48px rgba(0,237,212,.48)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >Start for free <span>&rarr;</span></Link>
            <a href="#intro" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(4,12,52,.30)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,.26)", color: "#fff",
              fontSize: 15, fontWeight: 500, padding: "16px 32px", borderRadius: 99,
              transition: "background .25s, border-color .25s, transform .25s",
            }}>See how it works</a>
          </div>
          <div className="rv d4" style={{
            marginTop: 44, display: "flex", alignItems: "center",
            background: "rgba(4,12,52,.36)", backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,.14)", borderRadius: 18, padding: "20px 36px",
          }}>
            {[
              { val: "7", lbl: "Platforms" }, null, { val: "$79.99", lbl: "Per month" }, null,
              { val: "3\u00d7", lbl: "Variations" }, null, { val: "73%", lbl: "vs Sprout" },
            ].map((item, i) =>
              item === null ? (
                <div key={`sep-${i}`} style={{ width: 1, height: 42, background: "rgba(255,255,255,.16)", flexShrink: 0 }} />
              ) : (
                <div key={item.lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 28px" }}>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", lineHeight: 1 }}>{item.val}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.55)", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4 }}>{item.lbl}</span>
                </div>
              )
            )}
          </div>
        </div>
        {/* Bottom strip */}
        <div style={{
          position: "relative", zIndex: 2, flexShrink: 0,
          borderTop: "1px solid rgba(255,255,255,.12)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px var(--pad)", background: "rgba(4,12,52,.38)", backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,.55)", lineHeight: 1.5, maxWidth: 300 }}>AI content intelligence for social teams who play to win.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <a href="#" className="stl-parent" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.38)", transition: "color .2s", fontSize: 13 }}>
                <STL text="Twitter / X" style={{ fontSize: 13, fontWeight: 400, color: "inherit" }} />
              </a>
              <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.16)" }} />
              <a href="mailto:hello@getsignal.ai" className="stl-parent" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.38)", transition: "color .2s", fontSize: 13 }}>
                <STL text="hello@getsignal.ai" style={{ fontSize: 13, fontWeight: 400, color: "inherit" }} />
              </a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right", fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,.40)", lineHeight: 1.55 }}>
              Est.&nbsp;2025
            </div>
          </div>
        </div>
      </section>

      {/* ══════ PLATFORMS ══════ */}
      <section style={secStyle} id="platforms">
        <div style={{ ...secInner, paddingTop: 96, paddingBottom: 96, textAlign: "center" }}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ ...eyebrow, justifyContent: "center" }}><span style={eyebrowBar} />Platforms</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(44px, 5.5vw, 80px)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.04, color: "#fff" }}>
              Seven platforms.<br /><span style={{ color: "var(--mu)", fontWeight: 400 }}>One intelligence layer.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>
            {PLATFORMS.map(p => (
              <div key={p.name} className={`platcard rv ${p.delay}`}
                style={{
                  "--pc": p.color, "--pc-bg": p.bg, "--pc-border": p.border, "--pc-a08": p.a08, "--pc-a20": p.a20,
                  position: "relative", padding: "32px 16px 28px",
                  border: `1px solid ${p.border}`, borderRadius: 18, background: p.bg,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                  transition: "background .35s, border-color .35s, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s",
                  overflow: "hidden", cursor: "none",
                } as React.CSSProperties}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = `0 16px 48px ${p.a08}, 0 0 0 1px ${p.border}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = p.border; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: p.bg, border: `1px solid ${p.border}`, transition: "background .35s, box-shadow .35s", flexShrink: 0 }}>
                  {p.icon}
                </div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: ".02em", textAlign: "center", lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: p.color, opacity: 0, transition: "opacity .35s" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MARQUEE ══════ */}
      <div style={{
        position: "relative", zIndex: 3,
        borderTop: "1px solid var(--glassbr)", borderBottom: "1px solid var(--glassbr)",
        padding: "13px 0", overflow: "hidden",
        background: "rgba(4,12,52,.70)", backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "mqa 28s linear infinite" }}>
          {[...MQ_ROW_A, ...MQ_ROW_A].map((m, i) => (
            <div key={`a-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "0 28px", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: m.lit ? "rgba(255,255,255,.52)" : "rgba(255,255,255,.18)" }}>
              {m.text}<span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ac)", opacity: .7, flexShrink: 0 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "mqb 38s linear infinite", marginTop: 7 }}>
          {[...MQ_ROW_B, ...MQ_ROW_B].map((m, i) => (
            <div key={`b-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "0 28px", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: m.lit ? "rgba(255,255,255,.52)" : "rgba(255,255,255,.18)" }}>
              {m.text}<span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ac)", opacity: .7, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ══════ HOW IT WORKS ══════ */}
      <section style={secStyle} id="intro">
        <div style={secInner}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ ...eyebrow, justifyContent: "center" }}><span style={eyebrowBar} />How it works</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(34px, 4vw, 62px)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.06, color: "#fff", marginBottom: 18 }}>
              A content intelligence tool<br />built for teams who play to win.
            </h2>
            <p style={{ fontSize: 19, fontWeight: 400, color: "var(--mu)", maxWidth: 680, lineHeight: 1.78, margin: "0 auto" }}>
              Most tools help you post. SIGNAL helps you win &mdash; by reverse-engineering what makes content go viral, generating three angle-tested variations, and publishing at the exact moment each platform rewards.
            </p>
          </div>
          <div className="rv d2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--glassbr)", borderRadius: 16, overflow: "hidden", marginTop: 48 }}>
            {HOW_CARDS.map((c, i) => (
              <div key={c.num} className="ioc" style={{
                padding: "32px 28px 36px", background: "rgba(4,12,52,.45)",
                borderRight: i < 2 ? "1px solid var(--glassbr)" : "none",
                transition: "background .35s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,237,212,.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(4,12,52,.45)")}
              >
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 18 }}>{c.num}</div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-.02em", marginBottom: 12, lineHeight: 1.2, whiteSpace: "pre-line" }}>{c.title}</div>
                <p style={{ fontSize: 16, fontWeight: 400, color: "var(--mu)", lineHeight: 1.65, marginBottom: 24 }}>{c.desc}</p>
                <div className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: "var(--ac)" }}>
                  <STL text="Explore" style={{ fontSize: 14, color: "var(--ac)", fontWeight: 600 }} /><span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ SERVICE PANELS ══════ */}
      {SERVICES.map(s => (
        <div key={s.num} style={{
          position: "relative", zIndex: 3,
          background: "var(--glass2)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid var(--glassbr)", overflow: "hidden",
        }}>
          <div style={{ maxWidth: "var(--wrap)", margin: "0 auto", padding: "72px var(--pad) 56px", textAlign: "center" }}>
            <span className="rv" style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".22em", color: "var(--dim)", marginBottom: 22, display: "block" }}>{s.num}</span>
            <div className="rv d1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ac)", marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--ac)", flexShrink: 0 }} />{s.label}
            </div>
            <p className="rv d2" style={{ fontSize: 18, fontWeight: 400, color: "var(--mu)", lineHeight: 1.80, maxWidth: 600, margin: "0 auto 40px" }}>{s.desc}</p>
            <div className="rv d3" style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: "center" }}>
              <a href="#" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 500, color: "var(--mu)", transition: "color .2s" }}>
                <STL text={s.cta1} style={{ fontSize: 15, fontWeight: 500, color: "inherit" }} /><span style={{ fontSize: 14, transition: "transform .3s" }}>&rarr;</span>
              </a>
              <a href="#" className="stl-parent" style={{ color: "#fff", padding: "12px 26px", border: "1px solid var(--glassbr)", borderRadius: 99, transition: "border-color .25s, background .25s" }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--a30)"; e.currentTarget.style.background = "rgba(0,237,212,.08)"; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--glassbr)"; e.currentTarget.style.background = ""; }}>
                <STL text={s.cta2} style={{ fontSize: 15, fontWeight: 500, color: "inherit" }} />
              </a>
            </div>
          </div>
          <div className="rv" style={{ padding: "36px var(--pad) 0" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(80px, 15vw, 210px)", fontWeight: 800, letterSpacing: "-.045em", lineHeight: .88, color: "#fff", userSelect: "none", textAlign: "center" }}>
              <span style={{ WebkitTextStroke: "1.5px rgba(255,255,255,.16)", color: "transparent" }}>{s.headTop}</span>&mdash;<br />
              {s.headAccent ? <span style={{ color: "var(--ac)" }}>{s.headBot}</span> : s.headBot}
            </div>
          </div>
          <div style={{
            borderTop: "1px solid var(--glassbr)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px var(--pad)", marginTop: 36,
          }}>
            <span style={{ fontSize: 13, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 500 }}>{s.tags}</span>
            <a href="#" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 500, color: "var(--mu)", transition: "color .2s" }}>
              <STL text={s.footCta} style={{ fontSize: 15, fontWeight: 500, color: "inherit" }} />
            </a>
          </div>
        </div>
      ))}

      {/* ══════ POSTURE ══════ */}
      <section style={secStyle} id="posture">
        <div style={secInner}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ ...eyebrow, justifyContent: "center" }}><span style={eyebrowBar} />Posture</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(32px, 4vw, 60px)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.08, color: "#fff" }}>
              Signal, not noise.<br /><span style={{ color: "var(--mu)", fontWeight: 400 }}>Intelligence that compounds.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
            {POSTURE.map((p, i) => (
              <div key={p.accent} className={`poscol rv d${i + 1}`} style={{
                padding: "36px 30px", background: "rgba(4,12,52,.40)",
                border: "1px solid var(--glassbr)", transition: "background .3s",
                borderRadius: i === 0 ? "16px 0 0 16px" : i === 3 ? "0 16px 16px 0" : undefined,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,237,212,.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(4,12,52,.40)")}
              >
                <div style={{ fontFamily: "var(--fd)", fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-.015em", lineHeight: 1.3, marginBottom: 14 }}>
                  <span style={{ color: "var(--ac)" }}>{p.accent}</span><br />{p.rest}
                </div>
                <p style={{ fontSize: 15, fontWeight: 400, color: "var(--mu)", lineHeight: 1.72 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CASES ══════ */}
      <section style={secStyle} id="cases">
        <div style={secInner}>
          <div className="rv" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ac)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 26, height: 1, background: "var(--ac)", flexShrink: 0 }} />Business cases
            </div>
            <a href="#" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 400, color: "var(--mu)", transition: "color .2s" }}>
              <STL text="View all results" style={{ fontSize: 15, color: "inherit" }} /><span>&rarr;</span>
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--glassbr)", borderRadius: 16, overflow: "hidden" }}>
            {CASES.map((c, i) => (
              <div key={c.title} className={`casecard rv d${i + 1}`} style={{ background: "rgba(4,12,52,.45)", transition: "background .4s", display: "flex", flexDirection: "column" }}
                   onMouseEnter={e => (e.currentTarget.style.background = "rgba(4,12,52,.65)")}
                   onMouseLeave={e => (e.currentTarget.style.background = "rgba(4,12,52,.45)")}>
                <div style={{ width: "100%", aspectRatio: "16/10", background: "rgba(4,12,52,.60)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(4,12,52,.8) 0%, rgba(0,8,30,.6) 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,237,212,.07) 40px, rgba(0,237,212,.07) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,237,212,.07) 40px, rgba(0,237,212,.07) 41px)" }} />
                    <div style={{ position: "relative", zIndex: 2, fontFamily: "var(--fd)", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-.04em", color: "rgba(255,255,255,.07)", textAlign: "center", padding: 16 }}>{c.wm}</div>
                  </div>
                </div>
                <div style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--glassbr)", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ac)", marginBottom: 10 }}>{c.cat}</div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-.02em", lineHeight: 1.2, marginBottom: 8 }}>{c.title}</div>
                  <p style={{ fontSize: 13, fontWeight: 400, color: "var(--mu)", lineHeight: 1.65, flex: 1, marginBottom: 16 }}>{c.sub}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ background: "rgba(0,237,212,.10)", border: "1px solid rgba(0,237,212,.22)", color: "var(--ac)", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>{c.pill}</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: "var(--dim)" }}>{c.rl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section style={secStyle} id="pricing">
        <div style={{ ...secInner, paddingTop: 96, paddingBottom: 96 }}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ ...eyebrow, justifyContent: "center" }}><span style={eyebrowBar} />Pricing</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(32px, 4vw, 60px)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.08, color: "#fff", marginBottom: 12 }}>
              Simple, transparent pricing.
            </h2>
            <p style={{ fontSize: 17, fontWeight: 400, color: "var(--mu)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Start free. Upgrade when you need more power. Cancel anytime.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--glassbr)", borderRadius: 16, overflow: "hidden" }}>
            {/* FREE */}
            <div className="rv d1" style={{ background: "rgba(4,12,52,.45)", padding: "40px 32px 36px", transition: "background .35s", display: "flex", flexDirection: "column" }}
                 onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,237,212,.04)")}
                 onMouseLeave={e => (e.currentTarget.style.background = "rgba(4,12,52,.45)")}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 20 }}>Free</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--fd)", fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", lineHeight: 1 }}>$0</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "var(--dim)", marginBottom: 28 }}>forever</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {["3 analyses / month", "1 platform per generation", "1 content variation", "Basic virality scoring", "Content library (10 saves)"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 400, color: "var(--mu)" }}>
                    <span style={{ color: "var(--ac)", fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/sign-up" style={{
                display: "block", textAlign: "center", padding: "14px 24px", borderRadius: 99,
                border: "1px solid var(--glassbr)", color: "var(--mu)",
                fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, letterSpacing: ".04em",
                transition: "border-color .25s, background .25s, color .25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--a30)"; e.currentTarget.style.background = "rgba(0,237,212,.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--glassbr)"; e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--mu)"; }}>
                Get started free
              </Link>
            </div>
            {/* PRO — $79.99 */}
            <div className="rv d2" style={{ background: "rgba(4,12,52,.55)", padding: "40px 32px 36px", transition: "background .35s", display: "flex", flexDirection: "column", position: "relative", borderLeft: "1px solid var(--glassbr)", borderRight: "1px solid var(--glassbr)" }}
                 onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,237,212,.06)")}
                 onMouseLeave={e => (e.currentTarget.style.background = "rgba(4,12,52,.55)")}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--ac)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ac)" }}>Pro</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", background: "var(--a12)", border: "1px solid var(--a30)", color: "var(--ac)", padding: "3px 10px", borderRadius: 99 }}>Most popular</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--fd)", fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", lineHeight: 1 }}>$79</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--dim)" }}>.99/mo</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "var(--dim)", marginBottom: 28 }}>billed monthly</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {["Unlimited analyses", "All 7 platforms", "3 A/B/C variations", "Advanced virality scoring", "Image prompt generation", "Brand voice profiles", "Content calendar", "Unlimited library saves", "SIGNAL Inbox", "Auto-publishing"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 400, color: "var(--mu)" }}>
                    <span style={{ color: "var(--ac)", fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/sign-up" style={{
                display: "block", textAlign: "center", padding: "14px 24px", borderRadius: 99,
                background: "#fff", color: "#060C3D",
                fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, letterSpacing: ".04em",
                transition: "background .25s, transform .3s, box-shadow .4s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--ac)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,237,212,.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                Upgrade to Pro
              </Link>
            </div>
            {/* AGENCY — $149 */}
            <div className="rv d3" style={{ background: "rgba(4,12,52,.45)", padding: "40px 32px 36px", transition: "background .35s", display: "flex", flexDirection: "column" }}
                 onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,237,212,.04)")}
                 onMouseLeave={e => (e.currentTarget.style.background = "rgba(4,12,52,.45)")}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 20 }}>Agency</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--fd)", fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", lineHeight: 1 }}>$149</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--dim)" }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "var(--dim)", marginBottom: 28 }}>billed monthly</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {["Everything in Pro", "5 team seats", "Unlimited brand profiles", "Priority AI processing", "Post approval workflows", "Export to CSV / PDF", "Dedicated support"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 400, color: "var(--mu)" }}>
                    <span style={{ color: "var(--ac)", fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/sign-up" style={{
                display: "block", textAlign: "center", padding: "14px 24px", borderRadius: 99,
                border: "1px solid var(--glassbr)", color: "var(--mu)",
                fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, letterSpacing: ".04em",
                transition: "border-color .25s, background .25s, color .25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--a30)"; e.currentTarget.style.background = "rgba(0,237,212,.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--glassbr)"; e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--mu)"; }}>
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section id="cta" style={{
        position: "relative", zIndex: 3, background: "rgba(4,12,52,.50)",
        backdropFilter: "blur(28px)", borderTop: "1px solid var(--glassbr)",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, var(--ac) 50%, transparent 100%)", opacity: .4 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "var(--wrap)", margin: "0 auto", padding: "96px var(--pad)", textAlign: "center" }}>
          <h2 className="rv" style={{ fontFamily: "var(--fd)", fontSize: "clamp(36px, 5.5vw, 80px)", fontWeight: 700, letterSpacing: "-.035em", lineHeight: 1.06, color: "#fff", marginBottom: 44 }}>
            <span style={{ display: "block" }}>Ready to stop guessing</span>
            <span style={{ display: "block", color: "var(--mu)", fontWeight: 400 }}>and start winning</span>
            <span style={{ display: "block", color: "var(--ac)" }}>on social?</span>
          </h2>
          <div className="rv d2" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Link href="/sign-up" className="stl-parent" style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "#fff", borderRadius: 99, padding: "16px 44px", overflow: "hidden",
              transition: "background .3s, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--ac)"; e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 64px rgba(0,237,212,.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <STL text="Start for free" style={{ fontSize: 15, fontWeight: 700, color: "#060C3D", letterSpacing: ".03em", fontFamily: "var(--fd)" }} />
              <span style={{ fontSize: 14, color: "#060C3D", transition: "transform .4s cubic-bezier(.16,1,.3,1)" }}>&rarr;</span>
            </Link>
          </div>
          <div className="rv d3" style={{ marginTop: 16, textAlign: "center" }}>
            <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "var(--mu)", transition: "color .2s" }}>Explore all plans &mdash; from $79.99/month</a>
          </div>
          <p className="rv d4" style={{ marginTop: 24, fontSize: 12, fontWeight: 400, color: "var(--dim)" }}>No credit card &middot; Cancel anytime &middot; 2 minute setup</p>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{
        position: "relative", zIndex: 3, background: "rgba(4,12,52,.80)",
        backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        borderTop: "1px solid var(--glassbr)", padding: "64px var(--pad) 40px",
      }}>
        <div className="rv" style={{ paddingBottom: 48, marginBottom: 48, borderBottom: "1px solid var(--glassbr)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(36px, 5.5vw, 80px)", fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1.02, color: "#fff" }}>
            AI content intelligence<br />
            <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.16)", color: "transparent" }}>for teams who</span>{" "}
            <span style={{ color: "var(--ac)" }}>win.</span>
          </div>
        </div>
        <div className="rv d1" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 80, marginBottom: 48 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--fd)", fontSize: 13, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 18, color: "#fff" }}>
              <div style={{ width: 22, height: 22, background: "var(--ac)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BoltIcon size={10} />
              </div>
              Signal
            </div>
            <p style={{ fontSize: 13, fontWeight: 400, color: "var(--mu)", lineHeight: 1.7, maxWidth: 250, marginBottom: 32 }}>AI-powered content intelligence platform for social teams who want to know what wins &mdash; before they post.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <a href="#" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--mu)", transition: "color .2s" }}>
                <span style={{ fontSize: 12, opacity: .6 }}>&#120143;</span><STL text="Twitter / X" style={{ fontSize: 13, color: "inherit" }} />
              </a>
              <a href="#" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--mu)", transition: "color .2s" }}>
                <span style={{ fontSize: 12, opacity: .6 }}>in</span><STL text="LinkedIn" style={{ fontSize: 13, color: "inherit" }} />
              </a>
              <a href="mailto:hello@getsignal.ai" className="stl-parent" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--mu)", transition: "color .2s" }}>
                <span style={{ fontSize: 12, opacity: .6 }}>&#x2709;</span><STL text="hello@getsignal.ai" style={{ fontSize: 13, color: "inherit" }} />
              </a>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
            <div>
              <h5 style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 22 }}>Platform</h5>
              {["Competitor Analysis", "AI Generation", "Virality Scoring", "Brand Voice Kit", "Content Calendar", "Auto-Publishing"].map(t => (
                <a key={t} href="#" style={{ display: "block", fontSize: 13, fontWeight: 400, color: "var(--mu)", marginBottom: 12, transition: "color .2s" }}>{t}</a>
              ))}
            </div>
            <div>
              <h5 style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 22 }}>Compare</h5>
              {["vs Sprout Social", "vs Hootsuite", "vs Buffer", "vs Later", "Pricing"].map(t => (
                <a key={t} href={t === "vs Sprout Social" ? "/compare/signal-vs-sprout-social" : "#"} style={{ display: "block", fontSize: 13, fontWeight: 400, color: "var(--mu)", marginBottom: 12, transition: "color .2s" }}>{t}</a>
              ))}
            </div>
            <div>
              <h5 style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 22 }}>Company</h5>
              {["About", "Blog", "Careers", "Contact", "Privacy"].map(t => (
                <a key={t} href="#" style={{ display: "block", fontSize: 13, fontWeight: 400, color: "var(--mu)", marginBottom: 12, transition: "color .2s" }}>{t}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--glassbr)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, fontWeight: 400, color: "var(--dim)" }}>&copy; 2025 SIGNAL. Built to beat Sprout Social. <em style={{ color: "var(--ac)", fontStyle: "normal", fontWeight: 600 }}>&#9889;</em></p>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {["Legal mentions", "Privacy policy"].map(t => (
              <a key={t} href="#" style={{ fontSize: 12, fontWeight: 400, color: "var(--dim)", transition: "color .2s" }}>{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
