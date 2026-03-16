"use client";

import { useState } from "react";
import Link from "next/link";
import { GuidedTourModal, TOUR_STEPS } from "@/components/TutorialCard";

export default function HelpPage() {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStartStep, setTourStartStep] = useState(0);

  const handleLaunchTour = () => {
    setTourOpen(true);
  };

  const handleResetTour = () => {
    try { localStorage.removeItem("signal_tutorial_dismissed"); } catch {}
    setTourOpen(true);
  };

  /* Group steps by section for the feature reference */
  const sections = TOUR_STEPS.reduce<Record<string, typeof TOUR_STEPS>>((acc, step) => {
    if (!acc[step.section]) acc[step.section] = [];
    acc[step.section].push(step);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
          Help & Tutorials
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
          Learn how to get the most out of SIGNAL
        </p>
      </div>

      {/* ── Launch Tour Card ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,182,212,.08), rgba(139,92,246,.04))",
        border: "1px solid rgba(6,182,212,.2)", borderRadius: 16,
        padding: "28px 28px", marginBottom: 32,
        display: "flex", alignItems: "center", gap: 24,
        position: "relative", overflow: "hidden",
      }}>
        {/* Gradient accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #0891b2, #8b5cf6, #ec4899)",
        }} />

        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: "linear-gradient(135deg, rgba(6,182,212,.15), rgba(139,92,246,.1))",
          border: "1px solid rgba(6,182,212,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, flexShrink: 0,
        }}>
          🗺️
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
              Interactive Guided Tour
            </h2>
            <span style={{
              fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
              background: "rgba(6,182,212,.1)", padding: "3px 10px", borderRadius: 99,
              letterSpacing: 1, fontWeight: 600,
            }}>
              {TOUR_STEPS.length} TABS
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, margin: "0 0 14px" }}>
            Walk through every section of SIGNAL step by step. Learn what each tab does, get pro tips, and master the platform in minutes. Navigate with arrow keys or click through at your own pace.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleLaunchTour} style={{
              padding: "10px 24px", borderRadius: 10,
              background: "linear-gradient(135deg, #0891b2, #7c3aed)",
              color: "#fff", border: "none", fontSize: 13,
              fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 0.5,
              cursor: "pointer", boxShadow: "0 0 16px rgba(6,182,212,.15)",
            }}>
              Launch Tour →
            </button>
            <button onClick={handleResetTour} style={{
              padding: "10px 20px", borderRadius: 10,
              background: "transparent", color: "#94a3b8",
              border: "1px solid rgba(255,255,255,.08)", fontSize: 12,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer",
            }}>
              Reset & Restart
            </button>
          </div>
        </div>
      </div>

      {/* ── Feature Reference (grouped by section) ── */}
      <h2 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", marginBottom: 20 }}>
        Feature Reference
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
        {Object.entries(sections).map(([sectionName, steps]) => (
          <div key={sectionName}>
            <div style={{
              fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#64748b",
              letterSpacing: 2, marginBottom: 10, paddingLeft: 2,
            }}>
              {sectionName}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {steps.map((s) => (
                <Link key={s.id} href={s.route} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12,
                  padding: "14px 16px", textDecoration: "none",
                  transition: "border-color .15s, transform .15s",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = `${s.color}40`;
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "";
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${s.color}10`, border: `1px solid ${s.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                      {s.headline} — {s.description.slice(0, 80)}...
                    </div>
                  </div>
                  <span style={{ color: "#334155", fontSize: 14, flexShrink: 0 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Start Guide ── */}
      <h2 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
        Quick Start Guide
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {[
          { step: "1", title: "Set up your brand voice", desc: "Go to Brand and define your tone, style, and keywords so AI content sounds like you.", href: "/brand" },
          { step: "2", title: "Connect your accounts", desc: "Link your social platforms in Accounts to enable direct publishing.", href: "/settings/accounts" },
          { step: "3", title: "Analyze a competitor", desc: "Use Analyze to study any competitor or topic and find content gaps.", href: "/analyze" },
          { step: "4", title: "Create your first post", desc: "Go to Create, pick a platform, and generate on-brand content in seconds.", href: "/create" },
          { step: "5", title: "Schedule and publish", desc: "Save your best content and schedule it across your content calendar.", href: "/schedule" },
        ].map((item) => (
          <Link key={item.step} href={item.href} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 10,
            padding: "14px 16px", textDecoration: "none", transition: "border-color 0.15s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535"; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#06b6d4",
              flexShrink: 0,
            }}>
              {item.step}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{item.desc}</div>
            </div>
            <span style={{ color: "#334155", fontSize: 14 }}>→</span>
          </Link>
        ))}
      </div>

      {/* ── Footer note ── */}
      <div style={{
        textAlign: "center", padding: "24px 0", borderTop: "1px solid rgba(255,255,255,.04)",
      }}>
        <p style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>
          Need more help? Contact us at{" "}
          <a href="mailto:support@influencccer.com" style={{ color: "#06b6d4", textDecoration: "none" }}>
            support@influencccer.com
          </a>
        </p>
      </div>

      {/* ── Tour Modal ── */}
      {tourOpen && <GuidedTourModal onClose={() => setTourOpen(false)} />}
    </div>
  );
}
