"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import PricingTable from "@/components/PricingTable";
import UsageBadge from "@/components/UsageBadge";
import PlatformBadge from "@/components/ui/PlatformBadge";
import TutorialCard from "@/components/TutorialCard";

interface DashboardData {
  stats: {
    savedCount: number;
    scheduledCount: number;
    publishedCount: number;
    brandCount: number;
    analysesUsed: number;
    generationsUsed: number;
    plan: string;
  };
  recentActivity: {
    id: string;
    type: string;
    title: string;
    metadata: string;
    createdAt: string;
  }[];
  upcomingPosts: {
    id: string;
    content: string;
    platform: string;
    scheduledFor: string;
    status: string;
    calendarColor: string;
  }[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  ANALYSIS: "\u{1F50D}",
  GENERATION: "\u270D\uFE0F",
  CONTENT_SAVED: "\u{1F4DA}",
  CONTENT_SCHEDULED: "\u{1F4C5}",
  CONTENT_PUBLISHED: "\u{1F680}",
  BRAND_PROFILE_CREATED: "\u{1F3A8}",
  BRAND_PROFILE_UPDATED: "\u{1F3A8}",
};

/* ── Onboarding checklist steps ── */
const ONBOARDING_STEPS = [
  { key: "brand", label: "Set up your brand voice", desc: "Define your tone so AI content sounds like you", href: "/brand", icon: "🎨", num: 1, checkField: "brandCount" as const },
  { key: "analyze", label: "Analyze a competitor", desc: "Study what's working in your niche", href: "/analyze", icon: "🔍", num: 2, checkField: "analysesUsed" as const },
  { key: "create", label: "Create your first post", desc: "Generate AI content for any platform", href: "/create", icon: "✍️", num: 3, checkField: "savedCount" as const },
  { key: "schedule", label: "Schedule a post", desc: "Plan your content calendar", href: "/schedule", icon: "📅", num: 4, checkField: "scheduledCount" as const },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load dashboard (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.stats) setData(d);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const plan = data?.stats.plan || "FREE";
  const analysesUsed = data?.stats.analysesUsed || 0;
  const analysesLimit = plan === "FREE" ? 3 : plan === "CREATOR" ? 25 : 999;

  /* ── Determine if user is brand new (all counts zero) ── */
  const isNewUser = data
    ? data.stats.savedCount === 0 &&
      data.stats.scheduledCount === 0 &&
      data.stats.publishedCount === 0 &&
      data.stats.brandCount === 0 &&
      data.stats.analysesUsed === 0
    : false;

  /* ── Onboarding progress ── */
  const completedSteps = data
    ? ONBOARDING_STEPS.filter((s) => {
        const val = data.stats[s.checkField];
        return val > 0;
      }).length
    : 0;
  const showOnboarding = !dismissedOnboarding && data && completedSteps < ONBOARDING_STEPS.length;

  /* ── Find next recommended step ── */
  const nextStep = data
    ? ONBOARDING_STEPS.find((s) => data.stats[s.checkField] === 0)
    : null;

  if (isLoading) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div className="shimmer" style={{ width: 280, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 200, height: 16, borderRadius: 6 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 110, borderRadius: 14 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="shimmer" style={{ height: 280, borderRadius: 14 }} />
          <div className="shimmer" style={{ height: 280, borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Unable to load dashboard</h2>
        <p style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{
          padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #0891b2, #0e7490)",
          color: "#fff", border: "none", fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: "pointer",
        }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
            {isNewUser ? "Let's get your content strategy started — follow the steps below" : "Your content intelligence hub"}
          </p>
        </div>
        <UsageBadge used={analysesUsed} limit={analysesLimit} plan={plan} />
      </div>

      {/* ── Tutorial Video Card ── */}
      <TutorialCard />

      {/* ═══════════════════════════════════════════════════════════════════════
          ONBOARDING CHECKLIST — clear numbered steps with next-action highlight
      ═══════════════════════════════════════════════════════════════════════ */}
      {showOnboarding && (
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,.08), rgba(6,182,212,.02))",
          border: "1px solid rgba(6,182,212,.2)",
          borderRadius: 16, padding: "24px 28px", marginBottom: 24,
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
                  letterSpacing: 2, background: "rgba(6,182,212,.12)", border: "1px solid rgba(6,182,212,.25)",
                  padding: "4px 12px", borderRadius: 999, fontWeight: 600,
                }}>
                  GET STARTED
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                  {completedSteps} of {ONBOARDING_STEPS.length} complete
                </span>
              </div>
              <h2 style={{ fontSize: 17, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                Set up SIGNAL in 4 easy steps
              </h2>
              {nextStep && (
                <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", margin: "6px 0 0" }}>
                  Next up: <span style={{ color: "#06b6d4", fontWeight: 600 }}>{nextStep.label}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setDismissedOnboarding(true)}
              style={{
                background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "#94a3b8", cursor: "pointer",
                fontSize: 14, padding: "4px 10px", lineHeight: 1, borderRadius: 6,
              }}
              aria-label="Dismiss onboarding"
            >
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div style={{
            width: "100%", height: 4, background: "rgba(255,255,255,.06)",
            borderRadius: 999, marginBottom: 20, overflow: "hidden",
          }}>
            <div style={{
              width: `${(completedSteps / ONBOARDING_STEPS.length) * 100}%`,
              height: "100%", background: "linear-gradient(90deg, #0891b2, #06b6d4)",
              borderRadius: 999, transition: "width .5s ease",
            }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {ONBOARDING_STEPS.map((step) => {
              const isDone = data ? data.stats[step.checkField] > 0 : false;
              const isNext = nextStep?.key === step.key;
              return (
                <Link key={step.key} href={step.href} style={{
                  background: isDone
                    ? "rgba(34,197,94,.06)"
                    : isNext
                    ? "rgba(6,182,212,.08)"
                    : "#060810",
                  border: `1px solid ${isDone ? "rgba(34,197,94,.2)" : isNext ? "rgba(6,182,212,.35)" : "#1e2535"}`,
                  borderRadius: 12, padding: "16px 14px", textDecoration: "none",
                  transition: "border-color .2s, transform .15s",
                  opacity: isDone ? 0.65 : 1,
                  position: "relative",
                }}
                  onMouseEnter={(e) => {
                    if (!isDone) (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.4)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isDone) (e.currentTarget as HTMLAnchorElement).style.borderColor = isNext ? "rgba(6,182,212,.35)" : "#1e2535";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "";
                  }}
                >
                  {/* Step number badge */}
                  <div style={{
                    position: "absolute", top: -8, left: 14,
                    width: 18, height: 18, borderRadius: "50%",
                    background: isDone ? "#22c55e" : isNext ? "#06b6d4" : "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: isDone || isNext ? "#000" : "#64748b",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {isDone ? "✓" : step.num}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 16 }}>{isDone ? "✅" : step.icon}</span>
                    <span style={{
                      fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 700,
                      color: isDone ? "#22c55e" : isNext ? "#06b6d4" : "#e2e8f0",
                      textDecoration: isDone ? "line-through" : "none",
                    }}>{step.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: isDone ? "#64748b" : "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                    {isDone ? "Completed" : step.desc}
                  </div>
                  {isNext && !isDone && (
                    <div style={{
                      marginTop: 10, fontSize: 10, fontFamily: "'DM Mono', monospace",
                      color: "#06b6d4", fontWeight: 600, letterSpacing: 0.5,
                    }}>
                      START →
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS CARDS — improved contrast, hierarchy, helper copy
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          {
            label: "SAVED CONTENT", val: data?.stats.savedCount || 0, color: "#3b82f6", href: "/library",
            emptyHint: "Save your first piece", activeHint: "in your library", icon: "📚",
          },
          {
            label: "SCHEDULED", val: data?.stats.scheduledCount || 0, color: "#f59e0b", href: "/schedule",
            emptyHint: "Schedule your first post", activeHint: "posts queued up", icon: "📅",
          },
          {
            label: "PUBLISHED", val: data?.stats.publishedCount || 0, color: "#22c55e", href: "/schedule",
            emptyHint: "Publish to go live", activeHint: "posts published", icon: "🚀",
          },
          {
            label: "BRAND VOICES", val: data?.stats.brandCount || 0, color: "#ec4899", href: "/brand",
            emptyHint: "Create your brand voice", activeHint: "voices configured", icon: "🎨",
          },
        ].map(({ label, val, color, href, emptyHint, activeHint, icon }) => (
          <Link
            key={label}
            href={href}
            style={{
              background: "#0a0d14",
              border: `1px solid ${val === 0 ? "#1e2535" : color + "25"}`,
              borderRadius: 14,
              padding: "18px 16px",
              textDecoration: "none",
              transition: "border-color 0.2s, transform .15s",
              display: "block",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = color + "50";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = val === 0 ? "#1e2535" : color + "25";
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
            }}
          >
            {/* Subtle glow at top */}
            {val > 0 && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
              }} />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, fontWeight: 500 }}>{label}</div>
              <span style={{ fontSize: 14 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 30, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: val === 0 ? "#475569" : color, marginBottom: 6, lineHeight: 1 }}>{val}</div>
            <div style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif",
              color: val === 0 ? "#06b6d4" : "#94a3b8",
              display: "flex", alignItems: "center", gap: 4, fontWeight: 500,
            }}>
              {val === 0 ? (
                <>
                  <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#06b6d4", flexShrink: 0, animation: "pulse-ring 2s infinite" }} />
                  {emptyHint}
                </>
              ) : (
                activeHint
              )}
            </div>
            {/* Clickable arrow hint */}
            <div style={{
              position: "absolute", bottom: 14, right: 14,
              fontSize: 12, color: "#334155", transition: "color .2s",
            }}>→</div>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { href: "/analyze", icon: "🔍", label: "Analyze", desc: "Study competitors" },
          { href: "/create", icon: "✍️", label: "Create", desc: "Generate content" },
          { href: "/schedule", icon: "📅", label: "Schedule", desc: "Plan your calendar" },
          { href: "/brand", icon: "🎨", label: "Brand", desc: "Manage voice" },
        ].map(({ href, icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 12,
              padding: "14px 14px",
              textDecoration: "none",
              transition: "border-color 0.2s, transform .15s",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.3)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535";
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
            }}
          >
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TO DO SECTION — with rich empty states
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: 2, fontWeight: 500 }}>TO DO</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {/* Drafts to review */}
          <Link href="/schedule?status=DRAFT" style={{
            background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(148,163,184,.2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(100,116,139,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📝</div>
            <div>
              <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#94a3b8" }}>{data?.stats.scheduledCount || 0}</div>
              <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", letterSpacing: 0.3 }}>
                {(data?.stats.scheduledCount || 0) === 0 ? "No drafts — create content to start" : "Drafts to review"}
              </div>
            </div>
          </Link>

          {/* Scheduled posts */}
          <Link href="/schedule" style={{
            background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
            <div>
              <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#06b6d4" }}>{data?.stats.scheduledCount || 0}</div>
              <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", letterSpacing: 0.3 }}>
                {(data?.stats.scheduledCount || 0) === 0 ? "No posts queued — plan ahead" : "Scheduled posts"}
              </div>
            </div>
          </Link>

          {/* Connected accounts */}
          <Link href="/settings/accounts" style={{
            background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(34,197,94,.2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔗</div>
            <div>
              <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#22c55e" }}>{data?.stats.brandCount || 0}</div>
              <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", letterSpacing: 0.3 }}>
                {(data?.stats.brandCount || 0) === 0 ? "Connect your first account" : "Connected accounts"}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          RECENT ACTIVITY + UPCOMING POSTS — improved contrast
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        {/* Recent Activity */}
        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: 2, fontWeight: 500 }}>RECENT ACTIVITY</div>
            <Link href="/inbox" style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4", textDecoration: "none", fontWeight: 600 }}>VIEW ALL →</Link>
          </div>

          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.6 }}>📋</div>
              <div style={{ fontSize: 14, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 6 }}>
                No activity yet
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 16 }}>
                Your analyses, content saves, and published posts will appear here as a timeline.
              </div>
              <Link href="/analyze" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#06b6d4",
                textDecoration: "none", padding: "8px 16px", borderRadius: 8,
                border: "1px solid rgba(6,182,212,.25)", background: "rgba(6,182,212,.08)",
                transition: "border-color .2s, background .2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.4)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.25)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.08)";
                }}
              >
                Run your first analysis →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.recentActivity.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <span style={{ fontSize: 14 }}>{ACTIVITY_ICONS[a.type] || "📋"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Posts */}
        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", letterSpacing: 2, fontWeight: 500 }}>UPCOMING POSTS</div>
            <Link href="/schedule" style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4", textDecoration: "none", fontWeight: 600 }}>VIEW ALL →</Link>
          </div>

          {(!data?.upcomingPosts || data.upcomingPosts.length === 0) ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.6 }}>📅</div>
              <div style={{ fontSize: 14, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 6 }}>
                No posts scheduled
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 16 }}>
                Scheduled posts will show here with platform, date, and preview. Plan your content ahead.
              </div>
              <Link href="/create" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#06b6d4",
                textDecoration: "none", padding: "8px 16px", borderRadius: 8,
                border: "1px solid rgba(6,182,212,.25)", background: "rgba(6,182,212,.08)",
                transition: "border-color .2s, background .2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.4)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.25)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.08)";
                }}
              >
                Create your first post →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.upcomingPosts.map((post) => (
                <div key={post.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)", borderLeft: `3px solid ${post.calendarColor}`, paddingLeft: 10 }}>
                  <PlatformBadge platform={post.platform} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.content.slice(0, 50)}{post.content.length > 50 ? "..." : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#06b6d4", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                    {new Date(post.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          UPGRADE SECTION — intentional, value-driven, not placeholder
      ═══════════════════════════════════════════════════════════════════════ */}
      {plan === "FREE" && (
        <div style={{ marginBottom: 40 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(6,182,212,.06), rgba(139,92,246,.04))",
            border: "1px solid rgba(6,182,212,.18)",
            borderRadius: 16, padding: "32px 32px 28px", marginBottom: 24,
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative gradient line at top */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, #0891b2, #8b5cf6, #ec4899)",
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "inline-block", fontSize: 10, fontFamily: "'DM Mono', monospace",
                  color: "#a78bfa", letterSpacing: 2, background: "rgba(139,92,246,.1)",
                  border: "1px solid rgba(139,92,246,.2)", padding: "4px 12px",
                  borderRadius: 999, marginBottom: 14, fontWeight: 600,
                }}>
                  UPGRADE
                </div>
                <h2 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f1f5f9", marginBottom: 10, lineHeight: 1.3 }}>
                  You're on the Free plan
                </h2>
                <p style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 16, maxWidth: 440 }}>
                  You've used <span style={{ color: "#06b6d4", fontWeight: 700 }}>{analysesUsed}</span> of{" "}
                  <span style={{ color: "#06b6d4", fontWeight: 700 }}>{analysesLimit}</span> analyses this month.
                  {analysesUsed >= analysesLimit
                    ? " You've hit your limit — upgrade now to keep analyzing."
                    : " Upgrade for unlimited analyses, multi-platform publishing, and priority support."}
                </p>

                {/* Usage bar */}
                <div style={{ maxWidth: 300, marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>MONTHLY USAGE</span>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: analysesUsed >= analysesLimit ? "#ef4444" : "#06b6d4" }}>
                      {analysesUsed}/{analysesLimit}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,.06)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min((analysesUsed / analysesLimit) * 100, 100)}%`,
                      height: "100%",
                      background: analysesUsed >= analysesLimit
                        ? "linear-gradient(90deg, #ef4444, #f97316)"
                        : "linear-gradient(90deg, #0891b2, #06b6d4)",
                      borderRadius: 999,
                      transition: "width .5s ease",
                    }} />
                  </div>
                </div>

                {/* Feature highlights */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                  {[
                    "Unlimited AI analyses & content generation",
                    "Multi-platform publishing (IG, TikTok, YouTube, X)",
                    "Advanced competitor tracking & alerts",
                    "Priority support + custom brand voices",
                  ].map((feat) => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#06b6d4", fontSize: 12, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA side */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 20 }}>
                <div style={{
                  fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}>
                  PRO
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>
                  Starting at<br />
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>$29</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>/mo</span>
                </div>
                <Link href="/settings/billing" style={{
                  padding: "12px 28px", borderRadius: 10, fontSize: 13,
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  background: "linear-gradient(135deg, #0891b2, #7c3aed)",
                  color: "#fff", textDecoration: "none", border: "none",
                  transition: "transform .15s, box-shadow .15s",
                  boxShadow: "0 0 20px rgba(6,182,212,.15)",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 24px rgba(6,182,212,.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 20px rgba(6,182,212,.15)";
                  }}
                >
                  Upgrade Now
                </Link>
                <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>Cancel anytime</span>
              </div>
            </div>
          </div>
          <PricingTable currentPlan={plan} variant="dark" />
        </div>
      )}
    </div>
  );
}
