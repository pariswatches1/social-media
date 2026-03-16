"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE GUIDED TOUR — replaces the old video tutorial card.
   Walks users through every sidebar tab with descriptions, tips,
   and a "Go there" button. Persists dismiss state in localStorage.
═══════════════════════════════════════════════════════════════════════ */

interface TourStep {
  id: string;
  section: string;
  icon: string;
  title: string;
  route: string;
  headline: string;
  description: string;
  tips: string[];
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard",
    section: "INTELLIGENCE",
    icon: "📊",
    title: "Dashboard",
    route: "/dashboard",
    headline: "Your command center",
    description: "See everything at a glance — saved content, scheduled posts, published pieces, brand profiles, and recent activity. The dashboard adapts as you use SIGNAL, surfacing what matters most.",
    tips: [
      "Check your usage badge (top-right) to see how many analyses you have left",
      "Follow the onboarding checklist to unlock SIGNAL's full power",
      "Click any stat card to jump directly to that section",
    ],
    color: "#06b6d4",
  },
  {
    id: "analyze",
    section: "INTELLIGENCE",
    icon: "🔍",
    title: "Analyze",
    route: "/analyze",
    headline: "Competitor intelligence",
    description: "Enter any topic, competitor URL, or content idea and SIGNAL's AI breaks it down into hooks, angles, post types, and strategic insights you can use immediately.",
    tips: [
      "Analyze your top 3 competitors to find content gaps",
      "Click any generated idea to instantly send it to the Create tab",
      "Save your best analyses to the Library for later",
    ],
    color: "#8b5cf6",
  },
  {
    id: "create",
    section: "INTELLIGENCE",
    icon: "✍️",
    title: "Create",
    route: "/create",
    headline: "AI content generation",
    description: "Generate platform-ready posts for Instagram, TikTok, LinkedIn, YouTube, and more. Your brand voice is automatically applied so every post sounds authentically you.",
    tips: [
      "Set up your Brand Voice first for best results",
      "Use the platform selector to get format-specific content",
      "Generate multiple variations and pick the strongest one",
    ],
    color: "#3b82f6",
  },
  {
    id: "virality",
    section: "INTELLIGENCE",
    icon: "🔥",
    title: "Virality",
    route: "/virality",
    headline: "Score your content before posting",
    description: "Paste any caption or post draft and get an instant virality score based on hook strength, format fit, trend alignment, timing, and engagement potential — with specific improvement suggestions.",
    tips: [
      "Aim for 70+ overall score before publishing",
      "The suggestions section tells you exactly what to fix",
      "Test different hooks on the same content to see what scores highest",
    ],
    color: "#f59e0b",
  },
  {
    id: "discover",
    section: "CREATORS",
    icon: "🌐",
    title: "Discover",
    route: "/discover",
    headline: "Find the right creators",
    description: "Search across platforms to discover influencers by niche, follower count, engagement rate, location, and trust score. Filter and sort to find the perfect match for your brand.",
    tips: [
      "Use niche keywords (not just names) for broader discovery",
      "Sort by engagement rate — not follower count — for better ROI",
      "Save promising creators to your CRM lists",
    ],
    color: "#06b6d4",
  },
  {
    id: "crm",
    section: "CREATORS",
    icon: "👥",
    title: "CRM",
    route: "/crm",
    headline: "Manage creator relationships",
    description: "Organize creators into color-coded lists, track engagement metrics, and manage your entire influencer pipeline. Never lose track of a promising partnership again.",
    tips: [
      "Create lists by campaign, niche, or tier (micro/macro/mega)",
      "Add notes to each creator for context during outreach",
      "Use the search and filter to quickly find specific creators",
    ],
    color: "#ec4899",
  },
  {
    id: "outreach",
    section: "CREATORS",
    icon: "📨",
    title: "Outreach",
    route: "/outreach",
    headline: "Email creator campaigns",
    description: "Send and track outreach emails to creators. Monitor open rates, replies, and bounces. Manage your entire outreach pipeline from draft to deal closed.",
    tips: [
      "Personalize each email — creators can spot mass templates instantly",
      "Follow up within 3 days if no reply (the tool tracks this)",
      "Track your reply rate to improve your pitch over time",
    ],
    color: "#22c55e",
  },
  {
    id: "campaigns",
    section: "CAMPAIGNS",
    icon: "🚀",
    title: "Campaigns",
    route: "/campaigns",
    headline: "Run full campaigns",
    description: "Create and manage influencer marketing campaigns end-to-end. Set goals, budgets, deliverables, and assign creators. Track everything in one place.",
    tips: [
      "Define clear goals (awareness vs. engagement vs. conversions)",
      "Set a realistic budget before assigning creators",
      "Use campaign analytics to measure what actually worked",
    ],
    color: "#f97316",
  },
  {
    id: "schedule",
    section: "PUBLISHING",
    icon: "📅",
    title: "Schedule",
    route: "/schedule",
    headline: "Plan your content calendar",
    description: "View your content in month, week, or list view. Schedule posts across platforms, track status (draft, scheduled, published), and never miss a posting window.",
    tips: [
      "Use the week view for detailed daily planning",
      "Color coding helps you see platform distribution at a glance",
      "Schedule at least a week ahead for consistent posting",
    ],
    color: "#06b6d4",
  },
  {
    id: "library",
    section: "PUBLISHING",
    icon: "📚",
    title: "Library",
    route: "/library",
    headline: "Your content vault",
    description: "Every piece of content you save lives here. Search, filter by platform, and quickly find that perfect post you created weeks ago. Your library grows as you use SIGNAL.",
    tips: [
      "Use the search bar to find content by keyword",
      "Filter by platform to see only Instagram, TikTok, etc.",
      "Re-use top-performing content as templates for new posts",
    ],
    color: "#3b82f6",
  },
  {
    id: "analytics",
    section: "ANALYTICS",
    icon: "📈",
    title: "Analytics",
    route: "/analytics",
    headline: "Measure what matters",
    description: "Track published posts, publishing frequency, active campaigns, and creator performance. See platform breakdowns and identify your top-performing content.",
    tips: [
      "Check weekly to spot trends in your best content",
      "Use platform breakdown to see where your audience is most active",
      "Compare campaigns to see which strategies drive results",
    ],
    color: "#22c55e",
  },
  {
    id: "brand",
    section: "SETTINGS",
    icon: "🎨",
    title: "Brand",
    route: "/brand",
    headline: "Define your brand voice",
    description: "Create brand profiles with custom voice, tone, audience guidelines, and example content. SIGNAL uses these to generate content that sounds authentically like your brand.",
    tips: [
      "Set this up FIRST — it makes all AI content dramatically better",
      "Create separate profiles for different brands or sub-brands",
      "Include 2-3 example posts so the AI learns your style",
    ],
    color: "#a855f7",
  },
  {
    id: "accounts",
    section: "SETTINGS",
    icon: "🔗",
    title: "Accounts",
    route: "/settings/accounts",
    headline: "Connect your social platforms",
    description: "Link your social media accounts for direct publishing. Credentials are AES-256 encrypted. Connect once, publish everywhere.",
    tips: [
      "Connect at least one account to unlock scheduling",
      "All credentials are encrypted — we never store plain text",
      "Disconnect anytime from this page",
    ],
    color: "#06b6d4",
  },
  {
    id: "help",
    section: "SETTINGS",
    icon: "❓",
    title: "Help",
    route: "/help",
    headline: "Get help anytime",
    description: "Access guided tours, quick-start guides, and support resources. Come back here whenever you need a refresher on any feature.",
    tips: [
      "Re-launch this guided tour anytime from the Help tab",
      "Follow the Quick Start Guide for a structured onboarding",
      "Check back as we add new features regularly",
    ],
    color: "#64748b",
  },
];

/* ── The dismissible card shown on the dashboard ── */
export default function TutorialCard() {
  const [dismissed, setDismissed] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem("signal_guided_tour_dismissed");
      if (d === "true") setDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem("signal_guided_tour_dismissed", "true"); } catch {}
  };

  const handleStartTour = () => {
    setTourOpen(true);
  };

  if (dismissed && !tourOpen) return null;

  return (
    <>
      {/* ── Dashboard prompt card ── */}
      {!dismissed && (
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.04))",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 14, padding: "20px 24px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 20, position: "relative",
        }}>
          <button onClick={handleDismiss} aria-label="Dismiss" style={{
            position: "absolute", top: 10, right: 12, background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.06)", color: "#94a3b8", fontSize: 14,
            cursor: "pointer", padding: "4px 8px", borderRadius: 6, lineHeight: 1,
          }}>✕</button>

          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(6,182,212,.15), rgba(139,92,246,.1))",
            border: "1px solid rgba(6,182,212,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, flexShrink: 0,
          }}>
            🗺️
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9" }}>
                Take the Guided Tour
              </span>
              <span style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
                background: "rgba(6,182,212,0.1)", padding: "3px 10px", borderRadius: 99,
                letterSpacing: 1, fontWeight: 600,
              }}>
                {TOUR_STEPS.length} TABS
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Walk through every section of SIGNAL step by step. Learn what each tab does, get pro tips, and master the platform in minutes.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button onClick={handleStartTour} style={{
                padding: "8px 20px", borderRadius: 8,
                background: "linear-gradient(135deg, #0891b2, #7c3aed)",
                color: "#0a1e3d", border: "none", fontSize: 12,
                fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 0.5,
                cursor: "pointer", transition: "transform .15s, box-shadow .15s",
                boxShadow: "0 0 16px rgba(6,182,212,.15)",
              }}>
                Start Tour →
              </button>
              <button onClick={handleDismiss} style={{
                padding: "8px 20px", borderRadius: 8,
                background: "transparent", color: "#94a3b8",
                border: "1px solid rgba(255,255,255,0.08)", fontSize: 12,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                cursor: "pointer", transition: "color 0.15s",
              }}>
                I know my way around
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-screen guided tour modal ── */}
      {tourOpen && <GuidedTourModal onClose={() => { setTourOpen(false); handleDismiss(); }} />}
    </>
  );
}

/* ── Exported so Help page can also launch it ── */
export function GuidedTourModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const goToStep = useCallback((idx: number) => {
    if (idx === currentStep || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(idx);
      setIsAnimating(false);
    }, 150);
  }, [currentStep, isAnimating]);

  const next = () => {
    if (currentStep < TOUR_STEPS.length - 1) goToStep(currentStep + 1);
    else onClose();
  };

  const prev = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleNavigate = () => {
    router.push(step.route);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 760,
        background: "#0a0d14", borderRadius: 20,
        border: "1px solid rgba(6,182,212,0.15)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.05)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        maxHeight: "90vh",
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,.04)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
              background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.2)",
              padding: "4px 12px", borderRadius: 999, letterSpacing: 2, fontWeight: 600,
            }}>
              GUIDED TOUR
            </div>
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.06)",
            color: "#94a3b8", fontSize: 14, cursor: "pointer",
            padding: "4px 10px", borderRadius: 6, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,.04)" }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: `linear-gradient(90deg, #0891b2, ${step.color})`,
            transition: "width .4s ease",
          }} />
        </div>

        {/* ── Step navigation pills ── */}
        <div style={{
          padding: "14px 24px 0", display: "flex", flexWrap: "wrap", gap: 4,
          overflowX: "auto",
        }}>
          {TOUR_STEPS.map((s, i) => {
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            return (
              <button key={s.id} onClick={() => goToStep(i)} style={{
                padding: "5px 10px", borderRadius: 6, border: "none",
                background: isActive ? `${s.color}20` : isPast ? "rgba(34,197,94,.06)" : "rgba(255,255,255,.03)",
                color: isActive ? s.color : isPast ? "#22c55e" : "#475569",
                fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: isActive ? 700 : 500,
                cursor: "pointer", transition: "all .15s", letterSpacing: 0.5,
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                <span style={{ marginRight: 4 }}>{isPast ? "✓" : s.icon}</span>
                {s.title}
              </button>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div style={{
          flex: 1, padding: "24px 28px 20px", overflowY: "auto",
          opacity: isAnimating ? 0 : 1, transition: "opacity .15s ease",
        }}>
          {/* Section label + Icon */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <span style={{
              fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#64748b",
              letterSpacing: 2,
            }}>
              {step.section}
            </span>
            <span style={{ color: "#334155" }}>›</span>
            <span style={{
              fontSize: 9, fontFamily: "'DM Mono', monospace", color: step.color,
              letterSpacing: 1, fontWeight: 600,
            }}>
              {step.title.toUpperCase()}
            </span>
          </div>

          {/* Big icon + headline */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `${step.color}10`, border: `1px solid ${step.color}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, flexShrink: 0,
            }}>
              {step.icon}
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
                color: "#f1f5f9", margin: "0 0 4px", lineHeight: 1.2,
              }}>
                {step.headline}
              </h2>
              <div style={{
                fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: step.color, fontWeight: 600,
              }}>
                {step.title}
              </div>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#cbd5e1",
            lineHeight: 1.8, margin: "0 0 24px", maxWidth: 580,
          }}>
            {step.description}
          </p>

          {/* Pro tips */}
          <div style={{
            background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)",
            borderRadius: 12, padding: "16px 18px",
          }}>
            <div style={{
              fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#f59e0b",
              letterSpacing: 2, marginBottom: 12, fontWeight: 600,
            }}>
              💡 PRO TIPS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {step.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: `${step.color}15`, border: `1px solid ${step.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: step.color, fontWeight: 700, flexShrink: 0,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    color: "#94a3b8", lineHeight: 1.6,
                  }}>
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigate button */}
          <button onClick={handleNavigate} style={{
            marginTop: 20, padding: "10px 20px", borderRadius: 10,
            background: `${step.color}15`, border: `1px solid ${step.color}30`,
            color: step.color, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, cursor: "pointer", transition: "all .15s",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Go to {step.title} →
          </button>
        </div>

        {/* ── Footer navigation ── */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,.04)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <button onClick={prev} disabled={currentStep === 0} style={{
            padding: "8px 18px", borderRadius: 8,
            background: currentStep === 0 ? "transparent" : "rgba(255,255,255,.04)",
            border: `1px solid ${currentStep === 0 ? "transparent" : "rgba(255,255,255,.06)"}`,
            color: currentStep === 0 ? "#334155" : "#94a3b8",
            fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            cursor: currentStep === 0 ? "default" : "pointer",
          }}>
            ← Previous
          </button>

          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
            Use ← → arrow keys
          </span>

          <button onClick={next} style={{
            padding: "8px 22px", borderRadius: 8,
            background: currentStep === TOUR_STEPS.length - 1
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : "linear-gradient(135deg, #0891b2, #0e7490)",
            border: "none", color: "#0a1e3d", fontSize: 12,
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            cursor: "pointer", transition: "transform .15s",
            letterSpacing: 0.5,
          }}>
            {currentStep === TOUR_STEPS.length - 1 ? "Finish Tour ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Export steps for use by Help page ── */
export { TOUR_STEPS };
export type { TourStep };
