"use client";

import { useState } from "react";

// ── Data ────────────────────────────────────────────────────────────────────────

const TOP_STATS = [
  { label: "Total Reach", value: "2.4M", change: "+12%", up: true, icon: "📡" },
  { label: "Engagement Rate", value: "4.7%", change: "+0.8%", up: true, icon: "💬" },
  { label: "Campaign ROI", value: "3.2x", change: "-0.1x", up: false, icon: "📈" },
  { label: "Active Creators", value: "23", change: "+5", up: true, icon: "👥" },
];

const BAR_DATA: Record<string, { day: string; height: number }[]> = {
  "7D": [
    { day: "M", height: 55 },
    { day: "T", height: 78 },
    { day: "W", height: 62 },
    { day: "T", height: 88 },
    { day: "F", height: 72 },
    { day: "S", height: 45 },
    { day: "S", height: 40 },
  ],
  "30D": [
    { day: "W1", height: 50 },
    { day: "W2", height: 65 },
    { day: "W3", height: 82 },
    { day: "W4", height: 74 },
    { day: "W5", height: 90 },
    { day: "W6", height: 68 },
    { day: "W7", height: 77 },
  ],
  "90D": [
    { day: "Jan", height: 45 },
    { day: "Feb", height: 60 },
    { day: "Mar", height: 75 },
    { day: "Apr", height: 88 },
    { day: "May", height: 70 },
    { day: "Jun", height: 85 },
    { day: "Jul", height: 90 },
  ],
  "12M": [
    { day: "Q1", height: 42 },
    { day: "Q2", height: 58 },
    { day: "Q3", height: 72 },
    { day: "Q4", height: 88 },
    { day: "Q1", height: 65 },
    { day: "Q2", height: 80 },
    { day: "Q3", height: 90 },
  ],
};

const PLATFORM_BREAKDOWN = [
  { name: "Instagram", pct: 42, color: "#06b6d4", emoji: "📸" },
  { name: "TikTok", pct: 28, color: "#10b981", emoji: "🎵" },
  { name: "YouTube", pct: 18, color: "#ef4444", emoji: "▶️" },
  { name: "X", pct: 8, color: "#3b82f6", emoji: "𝕏" },
  { name: "LinkedIn", pct: 4, color: "#8b5cf6", emoji: "💼" },
];

const TOP_CONTENT = [
  { text: "Stop scrolling — this one hack changed how I film content forever", platform: "🎵", reach: "892K", eng: "6.2%", score: 91 },
  { text: "3 things nobody tells you about building an audience from scratch", platform: "📸", reach: "654K", eng: "5.8%", score: 84 },
  { text: "I tested 10 hooks over 30 days. Here's exactly what worked best", platform: "▶️", reach: "512K", eng: "4.9%", score: 79 },
  { text: "Hot take: consistency matters way less than most people think", platform: "𝕏", reach: "310K", eng: "3.4%", score: 61 },
  { text: "The algorithm rewards early engagement. Here's how to get it fast", platform: "💼", reach: "198K", eng: "2.7%", score: 53 },
];

const TOP_CREATORS = [
  { initials: "MR", name: "Maya Rodriguez", platform: "📸 Instagram", spend: "$4,200", revenue: "$18,900", roi: "4.5x", color: "#06b6d4" },
  { initials: "JT", name: "Jake Thompson", platform: "🎵 TikTok", spend: "$2,800", revenue: "$11,200", roi: "4.0x", color: "#10b981" },
  { initials: "SK", name: "Sara Kim", platform: "▶️ YouTube", spend: "$6,500", revenue: "$22,100", roi: "3.4x", color: "#8b5cf6" },
  { initials: "DL", name: "David Lee", platform: "𝕏 X", spend: "$1,500", revenue: "$4,200", roi: "2.8x", color: "#f59e0b" },
  { initials: "AP", name: "Aisha Patel", platform: "💼 LinkedIn", spend: "$3,100", revenue: "$7,440", roi: "2.4x", color: "#ef4444" },
];

function getScoreColor(score: number) {
  if (score > 80) return "#06b6d4";
  if (score >= 60) return "#10b981";
  if (score >= 30) return "#f59e0b";
  return "#ef4444";
}

function getRoiBg(roi: string) {
  const val = parseFloat(roi);
  if (val >= 4) return { bg: "rgba(6,182,212,0.15)", border: "rgba(6,182,212,0.3)", color: "#06b6d4" };
  if (val >= 3) return { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", color: "#10b981" };
  return { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", color: "#f59e0b" };
}

// ── Components ───────────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, up, icon }: typeof TOP_STATS[0]) {
  return (
    <div style={{
      background: "#0a0d14",
      border: "1px solid #1e2535",
      borderRadius: 12,
      padding: "20px 22px",
      flex: 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{
          fontSize: 9, fontFamily: "'DM Mono', monospace",
          letterSpacing: 2, color: "#4a5568", textTransform: "uppercase",
        }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800,
        color: "#06b6d4", lineHeight: 1, marginBottom: 8,
      }}>{value}</div>
      <div style={{
        fontSize: 12, fontFamily: "'DM Mono', monospace",
        color: up ? "#10b981" : "#ef4444",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <span>{up ? "▲" : "▼"}</span>
        <span>{change} vs last period</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [timeTab, setTimeTab] = useState<"7D" | "30D" | "90D" | "12M">("7D");
  const bars = BAR_DATA[timeTab];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <h1 style={{
            fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800,
            color: "#e2e8f0", margin: 0,
          }}>Analytics</h1>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Track performance, measure ROI, and surface actionable insights.
        </p>
      </div>

      {/* Top Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {TOP_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Mid Row: Performance + Platform */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Performance Over Time */}
        <div style={{
          background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{
              fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
              color: "#e2e8f0", letterSpacing: 0.5,
            }}>Performance Over Time</span>
            <div style={{ display: "flex", gap: 4 }}>
              {(["7D", "30D", "90D", "12M"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeTab(t)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: timeTab === t ? "1px solid rgba(6,182,212,0.3)" : "1px solid #1e2535",
                    background: timeTab === t ? "rgba(6,182,212,0.1)" : "transparent",
                    color: timeTab === t ? "#06b6d4" : "#94a3b8",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            height: 120, padding: "0 4px",
          }}>
            {bars.map((b, i) => (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                height: "100%", justifyContent: "flex-end",
              }}>
                <div style={{
                  width: "100%",
                  height: `${b.height}%`,
                  background: "linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)",
                  borderRadius: "4px 4px 2px 2px",
                  transition: "height 0.5s ease",
                  boxShadow: "0 0 8px rgba(6,182,212,0.25)",
                }} />
                <span style={{
                  fontSize: 10, fontFamily: "'DM Mono', monospace",
                  color: "#4a5568", letterSpacing: 1,
                }}>{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div style={{
          background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24,
        }}>
          <div style={{
            fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
            color: "#e2e8f0", letterSpacing: 0.5, marginBottom: 20,
          }}>Platform Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PLATFORM_BREAKDOWN.map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>{p.emoji}</span>
                    <span style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>{p.name}</span>
                  </div>
                  <span style={{
                    fontSize: 12, fontFamily: "'DM Mono', monospace",
                    color: p.color, fontWeight: 600,
                  }}>{p.pct}%</span>
                </div>
                <div style={{ background: "#1e2535", borderRadius: 6, height: 7, overflow: "hidden" }}>
                  <div style={{
                    width: `${p.pct}%`, height: "100%",
                    background: p.color,
                    borderRadius: 6,
                    boxShadow: `0 0 8px ${p.color}44`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Content + Top Creators */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Top Performing Content */}
        <div style={{
          background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24,
        }}>
          <div style={{
            fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
            color: "#e2e8f0", letterSpacing: 0.5, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>🏆</span> Top Performing Content
          </div>

          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 32px 72px 64px 52px",
            gap: 8, padding: "6px 10px", borderBottom: "1px solid #1e2535", marginBottom: 4,
          }}>
            {["CONTENT", "", "REACH", "ENG.", "SCORE"].map((h, i) => (
              <span key={i} style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace",
                letterSpacing: 2, color: "#4a5568",
              }}>{h}</span>
            ))}
          </div>

          {TOP_CONTENT.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 32px 72px 64px 52px",
              gap: 8,
              padding: "10px 10px",
              background: i % 2 === 0 ? "#060810" : "#0a0d14",
              borderRadius: 6,
              alignItems: "center",
              marginBottom: 2,
            }}>
              <span style={{
                fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{row.text}</span>
              <span style={{ fontSize: 16, textAlign: "center" }}>{row.platform}</span>
              <span style={{
                fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#e2e8f0", fontWeight: 600,
              }}>{row.reach}</span>
              <span style={{
                fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#10b981",
              }}>{row.eng}</span>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: `${getScoreColor(row.score)}18`,
                border: `1px solid ${getScoreColor(row.score)}33`,
                borderRadius: 5,
                padding: "2px 7px",
              }}>
                <span style={{
                  fontSize: 11, fontFamily: "'DM Mono', monospace",
                  fontWeight: 700, color: getScoreColor(row.score),
                }}>{row.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Creators by ROI */}
        <div style={{
          background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24,
        }}>
          <div style={{
            fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
            color: "#e2e8f0", letterSpacing: 0.5, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⭐</span> Top Creators by ROI
          </div>

          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 100px 72px 72px 56px",
            gap: 8, padding: "6px 10px", borderBottom: "1px solid #1e2535", marginBottom: 4,
          }}>
            {["CREATOR", "PLATFORM", "SPEND", "REVENUE", "ROI"].map((h) => (
              <span key={h} style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace",
                letterSpacing: 2, color: "#4a5568",
              }}>{h}</span>
            ))}
          </div>

          {TOP_CREATORS.map((row, i) => {
            const roiStyle = getRoiBg(row.roi);
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 100px 72px 72px 56px",
                gap: 8,
                padding: "10px 10px",
                background: i % 2 === 0 ? "#060810" : "#0a0d14",
                borderRadius: 6,
                alignItems: "center",
                marginBottom: 2,
              }}>
                {/* Avatar + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${row.color}22`,
                    border: `1px solid ${row.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 10, fontFamily: "'Syne', sans-serif",
                      fontWeight: 800, color: row.color,
                    }}>{row.initials}</span>
                  </div>
                  <span style={{
                    fontSize: 12, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{row.name}</span>
                </div>
                <span style={{
                  fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{row.platform}</span>
                <span style={{
                  fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#94a3b8",
                }}>{row.spend}</span>
                <span style={{
                  fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#e2e8f0", fontWeight: 600,
                }}>{row.revenue}</span>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: roiStyle.bg,
                  border: `1px solid ${roiStyle.border}`,
                  borderRadius: 5,
                  padding: "2px 7px",
                }}>
                  <span style={{
                    fontSize: 11, fontFamily: "'DM Mono', monospace",
                    fontWeight: 700, color: roiStyle.color,
                  }}>{row.roi}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}