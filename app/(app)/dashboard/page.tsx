"use client";

import { useEffect, useState, useRef } from "react";
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
  ANALYSIS: "🔍",
  GENERATION: "✍️",
  CONTENT_SAVED: "📚",
  CONTENT_SCHEDULED: "📅",
  CONTENT_PUBLISHED: "🚀",
  BRAND_PROFILE_CREATED: "🎨",
  BRAND_PROFILE_UPDATED: "🎨",
};

/* ── Onboarding checklist steps ── */
const ONBOARDING_STEPS = [
  { key: "brand", label: "Set up your brand voice", desc: "Define your tone so AI content sounds like you", href: "/brand", icon: "🎨", checkField: "brandCount" as const },
  { key: "analyze", label: "Analyze a competitor", desc: "Study what's working in your niche", href: "/analyze", icon: "🔍", checkField: "analysesUsed" as const },
  { key: "create", label: "Create your first post", desc: "Generate AI content for any platform", href: "/create", icon: "✍️", checkField: "savedCount" as const },
  { key: "schedule", label: "Schedule a post", desc: "Plan your content calendar", href: "/schedule", icon: "📅", checkField: "scheduledCount" as const },
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

  if (isLoading) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div className="shimmer" style={{ width: 280, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 200, height: 16, borderRadius: 6 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 100, borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="shimmer" style={{ height: 280, borderRadius: 12 }} />
          <div className="shimmer" style={{ height: 280, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Unable to load dashboard</h2>
        <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>{error}</p>
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
          <h1 style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
            {isNewUser ? "Let's get your content strategy started" : "Your content intelligence hub"}
          </p>
        </div>
        <UsageBadge used={analysesUsed} limit={analysesLimit} plan={plan} />
      </div>

      {/* ── Tutorial Video Card ── */}
      <TutorialCard />

      {/* ═══════════════════════════════════════════════════════════════════════
          P2: ONBOARDING CHECKLIST — shown until all steps complete
      ═══════════════════════════════════════════════════════════════════════ */}
      {showOnboarding && (
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,.06), rgba(6,182,212,.02))",
          border: "1px solid rgba(6,182,212,.2)",
          borderRadius: 16, padding: "24px 28px", marginBottom: 24,
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
                  letterSpacing: 2, background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.25)",
                  padding: "3px 10px", borderRadius: 999,
                }}>
                  GET STARTED
                </div>
                <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
                  {completedSteps}/{ONBOARDING_STEPS.length} complete
                </span>
              </div>
              <h2 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
                Set up SIGNAL in 4 steps
              </h2>
            </div>
            <button
              onClick={() => setDismissedOnboarding(true)}
              style={{
                background: "transparent", border: "none", color: "#4a5568", cursor: "pointer",
                fontSize: 16, padding: "4px 8px", lineHeight: 1,
              }}
              aria-label="Dismiss onboarding"
            >
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div style={{
            width: "100%", height: 3, background: "rgba(255,255,255,.06)",
            borderRadius: 999, marginBottom: 18, overflow: "hidden",
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
              return (
                <Link key={step.key} href={step.href} style={{
                  background: isDone ? "rgba(34,197,94,.06)" : "#060810",
                  border: `1px solid ${isDone ? "rgba(34,197,94,.2)" : "#1e2535"}`,
                  borderRadius: 12, padding: "14px 12px", textDecoration: "none",
                  transition: "border-color .2s, transform .15s",
                  opacity: isDone ? 0.7 : 1,
                }}
                  onMouseEnter={(e) => {
                    if (!isDone) (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.3)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isDone) (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{isDone ? "✅" : step.icon}</span>
                    <span style={{
                      fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 600,
                      color: isDone ? "#22c55e" : "#e2e8f0",
                      textDecoration: isDone ? "line-through" : "none",
                    }}>{step.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>
                    {isDone ? "Done" : step.desc}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          P1 + P4: STATS CARDS — with empty state helper text & context
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          {
            label: "SAVED CONTENT", val: data?.stats.savedCount || 0, color: "#3b82f6", href: "/library",
            emptyHint: "Save your first piece", activeHint: "piece" + ((data?.stats.savedCount || 0) !== 1 ? "s" : "") + " in library",
          },
          {
            label: "SCHEDULED", val: data?.stats.scheduledCount || 0, color: "#f59e0b", href: "/schedule",
            emptyHint: "Schedule your first post", activeHint: "post" + ((data?.stats.scheduledCount || 0) !== 1 ? "s" : "") + " queued",
          },
          {
            label: "PUBLISHED", val: data?.stats.publishedCount || 0, color: "#22c55e", href: "/schedule",
            emptyHint: "Publish to go live", activeHint: "post" + ((data?.stats.publishedCount || 0) !== 1 ? "s" : "") + " live",
          },
          {
            label: "BRAND PROFILES", val: data?.stats.brandCount || 0, color: "#ec4899", href: "/brand",
            emptyHint: "Create your brand voice", activeHint: "voice" + ((data?.stats.brandCount || 0) !== 1 ? "s" : "") + " configured",
          },
        ].map(({ label, val, color, href, emptyHint, activeHint }) => (
          <Link
            key={label}
            href={href}
            style={{
              background: "#0a0d14",
              border: `1px solid ${val === 0 ? "#1e2535" : color + "20"}`,
              borderRadius: 12,
              padding: 18,
              textDecoration: "none",
              transition: "border-color 0.2s, transform .15s",
              display: "block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = color + "50";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = val === 0 ? "#1e2535" : color + "20";
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
            }}
          >
            <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color, marginBottom: 4 }}>{val}</div>
            <div style={{
              fontSize: 10, fontFamily: "'DM Mono', monospace",
              color: val === 0 ? "#06b6d4" : "#4a5568",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {val === 0 ? (
                <>
                  <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "#06b6d4", flexShrink: 0 }} />
                  {emptyHint}
                </>
              ) : (
                activeHint
              )}
            </div>
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
              padding: "16px 14px",
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
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          P1: TO DO SECTION — with rich empty states
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>TO DO</div>
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
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 0.5 }}>
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
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 0.5 }}>
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
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 0.5 }}>
                {(data?.stats.brandCount || 0) === 0 ? "Connect your first account" : "Connected accounts"}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          P1 + P3: RECENT ACTIVITY + UPCOMING POSTS — rich empty states
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
        {/* Recent Activity */}
        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>RECENT ACTIVITY</div>
            <Link href="/inbox" style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4", textDecoration: "none" }}>VIEW ALL →</Link>
          </div>

          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.5 }}>📋</div>
              <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 6 }}>
                No activity yet
              </div>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", lineHeight: 1.7, marginBottom: 16 }}>
                Your analyses, content saves, and published posts will appear here as a timeline.
              </div>
              <Link href="/analyze" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
                textDecoration: "none", padding: "6px 14px", borderRadius: 8,
                border: "1px solid rgba(6,182,212,.2)", background: "rgba(6,182,212,.05)",
                transition: "border-color .2s, background .2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.4)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.2)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.05)";
                }}
              >
                Run your first analysis →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.recentActivity.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #111827" }}>
                  <span style={{ fontSize: 14 }}>{ACTIVITY_ICONS[a.type] || "📋"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#2d3748", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
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
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>UPCOMING POSTS</div>
            <Link href="/schedule" style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4", textDecoration: "none" }}>VIEW ALL →</Link>
          </div>

          {(!data?.upcomingPosts || data.upcomingPosts.length === 0) ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.5 }}>📅</div>
              <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 6 }}>
                No posts scheduled
              </div>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", lineHeight: 1.7, marginBottom: 16 }}>
                Scheduled posts will show here with platform, date, and preview. Plan your content ahead.
              </div>
              <Link href="/create" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4",
                textDecoration: "none", padding: "6px 14px", borderRadius: 8,
                border: "1px solid rgba(6,182,212,.2)", background: "rgba(6,182,212,.05)",
                transition: "border-color .2s, background .2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.4)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,.2)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,.05)";
                }}
              >
                Create your first post →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.upcomingPosts.map((post) => (
                <div key={post.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #111827", borderLeft: `3px solid ${post.calendarColor}`, paddingLeft: 10 }}>
                  <PlatformBadge platform={post.platform} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

      {/* ── Pricing (free plan only) ── */}
      {plan === "FREE" && (
        <div style={{ marginBottom: 40 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(6,182,212,.04), rgba(6,182,212,.01))",
            border: "1px solid rgba(6,182,212,.12)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            textAlign: "center",
          }}>
            <h2 style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
              Unlock your full potential
            </h2>
            <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
              You've used {analysesUsed}/{analysesLimit} analyses this month.
              {analysesUsed >= analysesLimit
                ? " Upgrade to keep going."
                : " Upgrade for unlimited analyses and multi-platform publishing."}
            </p>
          </div>
          <PricingTable currentPlan={plan} variant="dark" />
        </div>
      )}
    </div>
  );
}
