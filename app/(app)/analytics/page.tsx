"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface AnalyticsData {
  overview: {
    totalPublished: number;
    publishRate: number;
    activeCampaigns: number;
    activeCreators: number;
    totalCampaigns: number;
    connectedAccounts: number;
  };
  platformBreakdown: { name: string; count: number; pct: number }[];
  topContent: {
    id: string;
    text: string;
    platform: string;
    publishedAt: string;
    status: string;
  }[];
  activityBreakdown: Record<string, number>;
  connectedPlatforms: { platform: string; name: string }[];
  range: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#06b6d4",
  Tiktok: "#10b981",
  Youtube: "#ef4444",
  Twitter: "#3b82f6",
  X: "#3b82f6",
  Linkedin: "#8b5cf6",
  Facebook: "#1877f2",
  Reddit: "#ff4500",
  Pinterest: "#e60023",
  Snapchat: "#fffc00",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  Instagram: "📸",
  Tiktok: "🎵",
  Youtube: "▶️",
  Twitter: "𝕏",
  X: "𝕏",
  Linkedin: "💼",
  Facebook: "📘",
  Reddit: "🔴",
  Pinterest: "📌",
  Snapchat: "👻",
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "#0a0d14",
        border: "1px solid #1e2535",
        borderRadius: 12,
        padding: "20px 22px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 2,
            color: "#4a5568",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          color: "#06b6d4",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/analytics?range=${range}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load analytics (${r.status})`);
        return r.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message || "Failed to load analytics"))
      .finally(() => setIsLoading(false));
  }, [range]);

  if (isLoading) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#e2e8f0",
          minHeight: "100vh",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 22 }}>📊</span>
            <h1
              style={{
                fontSize: 22,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: "#e2e8f0",
                margin: 0,
              }}
            >
              Analytics
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            Loading your performance data...
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="shimmer"
              style={{
                flex: 1,
                height: 100,
                borderRadius: 12,
                background: "#0a0d14",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {[1, 2].map((i) => (
            <div
              key={i}
              className="shimmer"
              style={{
                height: 240,
                borderRadius: 12,
                background: "#0a0d14",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#e2e8f0",
          minHeight: "100vh",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 22 }}>📊</span>
            <h1
              style={{
                fontSize: 22,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: "#e2e8f0",
                margin: 0,
              }}
            >
              Analytics
            </h1>
          </div>
        </div>
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#ef4444", marginBottom: 12 }}>{error}</p>
          <button
            onClick={() => setRange(range)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(6,182,212,0.3)",
              background: "rgba(6,182,212,0.1)",
              color: "#06b6d4",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const ov = data.overview;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 22 }}>📊</span>
          <h1
            style={{
              fontSize: 22,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Analytics
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Track performance, measure ROI, and surface actionable insights.
        </p>
      </div>

      {/* Time Range Toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["7d", "30d", "90d", "12m"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setRange(t)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border:
                range === t
                  ? "1px solid rgba(6,182,212,0.3)"
                  : "1px solid #1e2535",
              background:
                range === t ? "rgba(6,182,212,0.1)" : "transparent",
              color: range === t ? "#06b6d4" : "#94a3b8",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Top Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard label="Published" value={ov.totalPublished} icon="🚀" />
        <StatCard label="Success Rate" value={`${ov.publishRate}%`} icon="✅" />
        <StatCard
          label="Active Campaigns"
          value={ov.activeCampaigns}
          icon="📈"
        />
        <StatCard
          label="Creators in CRM"
          value={ov.activeCreators}
          icon="👥"
        />
      </div>

      {/* Mid Row: Platform Breakdown + Connected Accounts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Platform Breakdown */}
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: 0.5,
              marginBottom: 20,
            }}
          >
            Platform Breakdown
          </div>
          {data.platformBreakdown.length === 0 ? (
            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
                color: "#4a5568",
                fontSize: 13,
              }}
            >
              No published content yet. Publish posts to see platform
              distribution.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {data.platformBreakdown.map((p) => {
                const color =
                  PLATFORM_COLORS[p.name] || "#06b6d4";
                const emoji = PLATFORM_EMOJIS[p.name] || "📱";
                return (
                  <div key={p.name}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 7,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 15 }}>{emoji}</span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#e2e8f0",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "'DM Mono', monospace",
                          color,
                          fontWeight: 600,
                        }}
                      >
                        {p.pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#1e2535",
                        borderRadius: 6,
                        height: 7,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${p.pct}%`,
                          height: "100%",
                          background: color,
                          borderRadius: 6,
                          boxShadow: `0 0 8px ${color}44`,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: 0.5,
              marginBottom: 20,
            }}
          >
            Activity Summary
          </div>
          {Object.keys(data.activityBreakdown).length === 0 ? (
            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
                color: "#4a5568",
                fontSize: 13,
              }}
            >
              No activity yet. Start creating, scheduling, and publishing
              content.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {Object.entries(data.activityBreakdown).map(([type, count]) => (
                <div
                  key={type}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#060810",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: "'DM Mono', monospace",
                      color: "#06b6d4",
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Published Content */}
      <div
        style={{
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: 0.5,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>🏆</span> Recent Published Content
        </div>

        {data.topContent.length === 0 ? (
          <div
            style={{
              padding: "30px 0",
              textAlign: "center",
              color: "#4a5568",
              fontSize: 13,
            }}
          >
            No published content in this time period. Schedule and publish
            posts to see them here.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 140px 80px",
                gap: 8,
                padding: "6px 10px",
                borderBottom: "1px solid #1e2535",
                marginBottom: 4,
              }}
            >
              {["CONTENT", "PLATFORM", "PUBLISHED", "STATUS"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 2,
                    color: "#4a5568",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {data.topContent.map((row, i) => (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 140px 80px",
                  gap: 8,
                  padding: "10px 10px",
                  background: i % 2 === 0 ? "#060810" : "#0a0d14",
                  borderRadius: 6,
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    fontFamily: "'DM Sans', sans-serif",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.text}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#e2e8f0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {PLATFORM_EMOJIS[row.platform.charAt(0).toUpperCase() + row.platform.slice(1)] || "📱"}{" "}
                  {row.platform}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    color: "#94a3b8",
                  }}
                >
                  {row.publishedAt
                    ? new Date(row.publishedAt).toLocaleDateString()
                    : "—"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    color:
                      row.status === "SUCCESS" ? "#10b981" : "#ef4444",
                  }}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
