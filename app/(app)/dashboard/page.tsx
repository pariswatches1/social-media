"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import PricingTable from "@/components/PricingTable";
import UsageBadge from "@/components/UsageBadge";
import PlatformBadge from "@/components/ui/PlatformBadge";

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

export default function DashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
            Your content intelligence hub
          </p>
        </div>
        <UsageBadge used={analysesUsed} limit={analysesLimit} plan={plan} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "SAVED CONTENT", val: data?.stats.savedCount || 0, color: "#3b82f6", href: "/library" },
          { label: "SCHEDULED", val: data?.stats.scheduledCount || 0, color: "#f59e0b", href: "/schedule" },
          { label: "PUBLISHED", val: data?.stats.publishedCount || 0, color: "#22c55e", href: "/schedule" },
          { label: "BRAND PROFILES", val: data?.stats.brandCount || 0, color: "#ec4899", href: "/brand" },
        ].map(({ label, val, color, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 12,
              padding: 18,
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color }}>{val}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
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
              transition: "border-color 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 12,
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

      {/* ── To Do Section (Sprout pattern) ── */}
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>TO DO</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <Link href="/schedule?status=DRAFT" style={{
            background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(100,116,139,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📝</div>
            <div>
              <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#94a3b8" }}>{data?.stats.scheduledCount || 0}</div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 0.5 }}>Drafts to review</div>
            </div>
          </Link>
          <Link href="/schedule" style={{
            background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
            <div>
              <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#06b6d4" }}>{data?.stats.scheduledCount || 0}</div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 0.5 }}>Scheduled posts</div>
            </div>
          </Link>
          <Link href="/settings/accounts" style={{
            background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: "16px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔗</div>
            <div>
              <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#22c55e" }}>{data?.stats.brandCount || 0}</div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 0.5 }}>Connected accounts</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two-column: Recent Activity + Upcoming Posts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
        {/* Recent Activity */}
        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>RECENT ACTIVITY</div>
            <Link href="/inbox" style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#06b6d4", textDecoration: "none" }}>VIEW ALL →</Link>
          </div>

          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#2d3748", fontFamily: "'DM Mono', monospace" }}>No activity yet. Start creating!</div>
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
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#2d3748", fontFamily: "'DM Mono', monospace" }}>No upcoming posts. Schedule some content!</div>
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

      {/* Pricing */}
      {plan === "FREE" && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Upgrade Your Plan</h2>
            <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>Unlock unlimited analyses and multi-platform generation</p>
          </div>
          <PricingTable currentPlan={plan} variant="dark" />
        </div>
      )}
    </div>
  );
}
