"use client";

import Link from "next/link";

interface ToolLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  platform: "instagram" | "youtube" | "general";
  children: React.ReactNode;
  seoContent?: React.ReactNode;
}

const platformColors: Record<string, string> = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  general: "#06b6d4",
};

export default function ToolLayout({ badge, title, subtitle, platform, children, seoContent }: ToolLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#e2e8f0" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>S</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: 2 }}>SIGNAL</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/tools" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>All Tools</Link>
          <Link href="/sign-in" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Log In</Link>
          <Link href="/sign-up" style={{ fontSize: 13, padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 600, letterSpacing: 0.5 }}>Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: `${platformColors[platform]}15`, border: `1px solid ${platformColors[platform]}40`, color: platformColors[platform], fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase" }}>{badge}</span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff", margin: "12px 0 10px", lineHeight: 1.2 }}>{title}</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>{subtitle}</p>
      </div>

      {/* Tool Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 40px" }}>
        {children}
      </div>

      {/* SEO Content */}
      {seoContent && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 40px" }}>
          {seoContent}
        </div>
      )}

      {/* CTA */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(14,116,144,0.08))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Want deeper analytics?</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>Get AI-powered competitor analysis, content generation, and auto-publishing with SIGNAL.</p>
          <Link href="/sign-up" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>Try SIGNAL Free →</Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4a5568" }}>© 2026 SIGNAL. Free tools for creators and marketers.</p>
      </footer>
    </div>
  );
}
