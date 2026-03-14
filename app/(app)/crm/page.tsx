"use client";

import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Platform = "Instagram" | "TikTok" | "YouTube" | "Twitter" | "LinkedIn" | "Pinterest";
type Status = "PROSPECT" | "CONTACTED" | "NEGOTIATING" | "ACTIVE" | "COMPLETED" | "DECLINED";

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  followers: string;
  followersRaw: number;
  engagement: string;
  engagementRaw: number;
  trustScore: number;
  status: Status;
  tags: string[];
  lists: string[];
  avatarColor: string;
  avatarInitials: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CREATORS: Creator[] = [
  {
    id: "1",
    name: "Aria Chen",
    handle: "@ariachen",
    platform: "Instagram",
    followers: "2.4M",
    followersRaw: 2400000,
    engagement: "4.8%",
    engagementRaw: 4.8,
    trustScore: 92,
    status: "ACTIVE",
    tags: ["fashion", "lifestyle"],
    lists: ["hot-prospects", "instagram-picks"],
    avatarColor: "#7c3aed",
    avatarInitials: "AC",
  },
  {
    id: "2",
    name: "Marcus Webb",
    handle: "@marcuswebb",
    platform: "TikTok",
    followers: "8.1M",
    followersRaw: 8100000,
    engagement: "6.2%",
    engagementRaw: 6.2,
    trustScore: 87,
    status: "NEGOTIATING",
    tags: ["comedy", "viral"],
    lists: ["hot-prospects", "tiktok-squad"],
    avatarColor: "#0891b2",
    avatarInitials: "MW",
  },
  {
    id: "3",
    name: "Sofia Ramirez",
    handle: "@sofiafit",
    platform: "Instagram",
    followers: "1.1M",
    followersRaw: 1100000,
    engagement: "7.3%",
    engagementRaw: 7.3,
    trustScore: 95,
    status: "VIP",
    tags: ["fitness", "wellness"],
    lists: ["vip-partners", "instagram-picks"],
    avatarColor: "#d97706",
    avatarInitials: "SR",
  },
  {
    id: "4",
    name: "Kai Tanaka",
    handle: "@kaitanaka",
    platform: "YouTube",
    followers: "3.7M",
    followersRaw: 3700000,
    engagement: "3.1%",
    engagementRaw: 3.1,
    trustScore: 89,
    status: "ACTIVE",
    tags: ["tech", "reviews"],
    lists: ["vip-partners"],
    avatarColor: "#dc2626",
    avatarInitials: "KT",
  },
  {
    id: "5",
    name: "Priya Nair",
    handle: "@priyanair",
    platform: "TikTok",
    followers: "5.2M",
    followersRaw: 5200000,
    engagement: "8.9%",
    engagementRaw: 8.9,
    trustScore: 91,
    status: "CONTACTED",
    tags: ["beauty", "skincare"],
    lists: ["hot-prospects", "tiktok-squad"],
    avatarColor: "#db2777",
    avatarInitials: "PN",
  },
  {
    id: "6",
    name: "Jake Morrison",
    handle: "@jakemor",
    platform: "YouTube",
    followers: "920K",
    followersRaw: 920000,
    engagement: "5.5%",
    engagementRaw: 5.5,
    trustScore: 78,
    status: "PROSPECT",
    tags: ["gaming", "esports"],
    lists: [],
    avatarColor: "#16a34a",
    avatarInitials: "JM",
  },
  {
    id: "7",
    name: "Luna Becker",
    handle: "@lunabecker",
    platform: "Instagram",
    followers: "680K",
    followersRaw: 680000,
    engagement: "9.1%",
    engagementRaw: 9.1,
    trustScore: 97,
    status: "ACTIVE",
    tags: ["art", "design"],
    lists: ["vip-partners", "instagram-picks"],
    avatarColor: "#9333ea",
    avatarInitials: "LB",
  },
  {
    id: "8",
    name: "Omar Hassan",
    handle: "@omarh_",
    platform: "Twitter",
    followers: "440K",
    followersRaw: 440000,
    engagement: "2.7%",
    engagementRaw: 2.7,
    trustScore: 72,
    status: "DECLINED",
    tags: ["crypto", "finance"],
    lists: [],
    avatarColor: "#0891b2",
    avatarInitials: "OH",
  },
  {
    id: "9",
    name: "Zoe Kim",
    handle: "@zoekim",
    platform: "TikTok",
    followers: "11.4M",
    followersRaw: 11400000,
    engagement: "5.4%",
    engagementRaw: 5.4,
    trustScore: 84,
    status: "NEGOTIATING",
    tags: ["dance", "entertainment"],
    lists: ["tiktok-squad"],
    avatarColor: "#f59e0b",
    avatarInitials: "ZK",
  },
  {
    id: "10",
    name: "Ryan Okafor",
    handle: "@ryanokafor",
    platform: "LinkedIn",
    followers: "320K",
    followersRaw: 320000,
    engagement: "4.2%",
    engagementRaw: 4.2,
    trustScore: 88,
    status: "CONTACTED",
    tags: ["b2b", "leadership"],
    lists: ["hot-prospects"],
    avatarColor: "#0e7490",
    avatarInitials: "RO",
  },
  {
    id: "11",
    name: "Camille Dubois",
    handle: "@camilledubois",
    platform: "Instagram",
    followers: "1.9M",
    followersRaw: 1900000,
    engagement: "6.8%",
    engagementRaw: 6.8,
    trustScore: 93,
    status: "ACTIVE",
    tags: ["travel", "luxury"],
    lists: ["vip-partners", "instagram-picks"],
    avatarColor: "#be185d",
    avatarInitials: "CD",
  },
  {
    id: "12",
    name: "Tyler Frost",
    handle: "@tylerfrost",
    platform: "YouTube",
    followers: "2.1M",
    followersRaw: 2100000,
    engagement: "3.8%",
    engagementRaw: 3.8,
    trustScore: 80,
    status: "COMPLETED",
    tags: ["food", "cooking"],
    lists: [],
    avatarColor: "#ea580c",
    avatarInitials: "TF",
  },
  {
    id: "13",
    name: "Nadia Volkov",
    handle: "@nadiavolkov",
    platform: "TikTok",
    followers: "6.8M",
    followersRaw: 6800000,
    engagement: "7.6%",
    engagementRaw: 7.6,
    trustScore: 90,
    status: "ACTIVE",
    tags: ["fashion", "trends"],
    lists: ["vip-partners", "tiktok-squad"],
    avatarColor: "#7c3aed",
    avatarInitials: "NV",
  },
  {
    id: "14",
    name: "Elias Bergmann",
    handle: "@eliasb",
    platform: "Pinterest",
    followers: "880K",
    followersRaw: 880000,
    engagement: "10.2%",
    engagementRaw: 10.2,
    trustScore: 85,
    status: "PROSPECT",
    tags: ["home", "interior"],
    lists: ["hot-prospects"],
    avatarColor: "#b91c1c",
    avatarInitials: "EB",
  },
  {
    id: "15",
    name: "Isla Thompson",
    handle: "@islathompson",
    platform: "Instagram",
    followers: "750K",
    followersRaw: 750000,
    engagement: "8.4%",
    engagementRaw: 8.4,
    trustScore: 96,
    status: "NEGOTIATING",
    tags: ["parenting", "lifestyle"],
    lists: ["instagram-picks"],
    avatarColor: "#059669",
    avatarInitials: "IT",
  },
  {
    id: "16",
    name: "Dev Patel",
    handle: "@devpateltech",
    platform: "YouTube",
    followers: "1.3M",
    followersRaw: 1300000,
    engagement: "4.1%",
    engagementRaw: 4.1,
    trustScore: 82,
    status: "CONTACTED",
    tags: ["tech", "coding"],
    lists: ["hot-prospects"],
    avatarColor: "#2563eb",
    avatarInitials: "DP",
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Status | string, string> = {
  PROSPECT: "#94a3b8",
  CONTACTED: "#f59e0b",
  NEGOTIATING: "#8b5cf6",
  ACTIVE: "#10b981",
  COMPLETED: "#06b6d4",
  DECLINED: "#ef4444",
  VIP: "#f59e0b",
};

const PLATFORM_ICONS: Record<Platform, string> = {
  Instagram: "📸",
  TikTok: "🎬",
  YouTube: "▶️",
  Twitter: "🐦",
  LinkedIn: "💼",
  Pinterest: "📌",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: "#e1306c",
  TikTok: "#69c9d0",
  YouTube: "#ff0000",
  Twitter: "#1da1f2",
  LinkedIn: "#0077b5",
  Pinterest: "#e60023",
};

const LISTS = [
  { id: "hot-prospects", label: "🔥 Hot Prospects", count: 12, dot: "#ef4444" },
  { id: "vip-partners", label: "⭐ VIP Partners", count: 8, dot: "#f59e0b" },
  { id: "instagram-picks", label: "📸 Instagram Picks", count: 15, dot: "#8b5cf6" },
  { id: "tiktok-squad", label: "🎬 TikTok Squad", count: 12, dot: "#06b6d4" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [activeList, setActiveList] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "card">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredList, setHoveredList] = useState<string | null>(null);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = MOCK_CREATORS;

    if (activeList !== "all") {
      result = result.filter((c) => c.lists.includes(activeList));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeList, search]);

  // ── Checkbox helpers ─────────────────────────────────────────────────────
  const allChecked = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));
  const someChecked = filtered.some((c) => selectedIds.has(c.id));

  function toggleAll() {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  const selectedCount = selectedIds.size;

  // ── Trust score bar ──────────────────────────────────────────────────────
  function TrustBar({ score }: { score: number }) {
    const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 60,
            height: 4,
            background: "#1e2535",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${score}%`,
              height: "100%",
              background: color,
              borderRadius: 2,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            color,
            minWidth: 24,
          }}
        >
          {score}
        </span>
      </div>
    );
  }

  // ── Status badge ─────────────────────────────────────────────────────────
  function StatusBadge({ status }: { status: string }) {
    const color = STATUS_COLORS[status] || "#94a3b8";
    return (
      <span
        style={{
          fontSize: 9,
          fontFamily: "'DM Mono', monospace",
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
          padding: "2px 7px",
          borderRadius: 20,
          letterSpacing: 0.8,
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>
    );
  }

  // ── Platform badge ───────────────────────────────────────────────────────
  function PlatformBadge({ platform }: { platform: Platform }) {
    const color = PLATFORM_COLORS[platform];
    const icon = PLATFORM_ICONS[platform];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontFamily: "'DM Mono', monospace",
          color,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          padding: "2px 7px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}
      >
        {icon} {platform}
      </span>
    );
  }

  // ── Card view ────────────────────────────────────────────────────────────
  function CardView() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
          padding: "16px 0",
        }}
      >
        {filtered.map((creator) => (
          <div
            key={creator.id}
            style={{
              background: selectedIds.has(creator.id) ? "rgba(6,182,212,0.04)" : "#0a0d14",
              border: `1px solid ${selectedIds.has(creator.id) ? "rgba(6,182,212,0.3)" : "#1e2535"}`,
              borderRadius: 12,
              padding: 16,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onClick={() => toggleOne(creator.id)}
          >
            {/* Avatar + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: creator.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {creator.avatarInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    color: "#e2e8f0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {creator.name}
                </div>
                <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
                  {creator.handle}
                </div>
              </div>
            </div>

            {/* Platform */}
            <div style={{ marginBottom: 10 }}>
              <PlatformBadge platform={creator.platform} />
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>FOLLOWERS</div>
                <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{creator.followers}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>ENG. RATE</div>
                <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#06b6d4" }}>{creator.engagement}</div>
              </div>
            </div>

            {/* Trust */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>TRUST SCORE</div>
              <TrustBar score={creator.trustScore} />
            </div>

            {/* Status + Tags */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <StatusBadge status={creator.status} />
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {creator.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 9,
                      fontFamily: "'DM Mono', monospace",
                      color: "#4a5568",
                      background: "#111827",
                      padding: "2px 6px",
                      borderRadius: 3,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 80px)",
        gap: 0,
        overflow: "hidden",
        margin: "-20px -24px",
      }}
    >
      {/* ── Left Sidebar ────────────────────────────────────────────────── */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          background: "#0a0d14",
          borderRight: "1px solid #1e2535",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
          overflowY: "auto",
        }}
      >
        {/* All Creators */}
        <div style={{ padding: "0 12px", marginBottom: 20 }}>
          <button
            onClick={() => setActiveList("all")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 10px",
              borderRadius: 8,
              border: activeList === "all" ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
              background: activeList === "all" ? "rgba(6,182,212,0.08)" : hoveredList === "all" ? "rgba(255,255,255,0.03)" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={() => setHoveredList("all")}
            onMouseLeave={() => setHoveredList(null)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>👥</span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: activeList === "all" ? "#06b6d4" : "#e2e8f0",
                }}
              >
                All Creators
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                color: activeList === "all" ? "#06b6d4" : "#4a5568",
                background: activeList === "all" ? "rgba(6,182,212,0.15)" : "#111827",
                padding: "1px 7px",
                borderRadius: 10,
              }}
            >
              47
            </span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1e2535", margin: "0 0 16px" }} />

        {/* My Lists header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px 10px",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              letterSpacing: 2,
            }}
          >
            MY LISTS
          </span>
          <button
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              border: "1px solid #1e2535",
              background: "transparent",
              color: "#4a5568",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
            title="New List"
          >
            +
          </button>
        </div>

        {/* List items */}
        <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {LISTS.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveList(list.id)}
              onMouseEnter={() => setHoveredList(list.id)}
              onMouseLeave={() => setHoveredList(null)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 10px",
                borderRadius: 8,
                border: activeList === list.id ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                background:
                  activeList === list.id
                    ? "rgba(6,182,212,0.08)"
                    : hoveredList === list.id
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Colored dot */}
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: list.dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    color: activeList === list.id ? "#e2e8f0" : "#94a3b8",
                    textAlign: "left",
                  }}
                >
                  {list.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'DM Mono', monospace",
                  color: activeList === list.id ? "#06b6d4" : "#4a5568",
                  background: activeList === list.id ? "rgba(6,182,212,0.15)" : "#111827",
                  padding: "1px 7px",
                  borderRadius: 10,
                  flexShrink: 0,
                }}
              >
                {list.count}
              </span>
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom stats */}
        <div
          style={{
            margin: "16px 12px 0",
            padding: 12,
            background: "#060810",
            border: "1px solid #1e2535",
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1.5, marginBottom: 8 }}>
            PIPELINE HEALTH
          </div>
          {[
            { label: "Active", count: MOCK_CREATORS.filter((c) => c.status === "ACTIVE").length, color: "#10b981" },
            { label: "Negotiating", count: MOCK_CREATORS.filter((c) => c.status === "NEGOTIATING").length, color: "#8b5cf6" },
            { label: "Prospects", count: MOCK_CREATORS.filter((c) => c.status === "PROSPECT").length, color: "#94a3b8" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: "#4a5568" }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#060810",
        }}
      >
        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 20px",
            borderBottom: "1px solid #1e2535",
            background: "#060810",
            flexShrink: 0,
          }}
        >
          {/* Page title */}
          <div style={{ marginRight: 4 }}>
            <h1
              style={{
                fontSize: 18,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: "#e2e8f0",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Creator CRM
            </h1>
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: "#1e2535" }} />

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
                color: "#4a5568",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators..."
              style={{
                width: "100%",
                background: "#0a0d14",
                border: "1px solid #1e2535",
                borderRadius: 8,
                padding: "8px 12px 8px 32px",
                color: "#e2e8f0",
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setView("list")}
              style={{
                padding: "7px 12px",
                border: "none",
                background: view === "list" ? "rgba(6,182,212,0.12)" : "transparent",
                color: view === "list" ? "#06b6d4" : "#4a5568",
                cursor: "pointer",
                fontSize: 14,
                borderRight: "1px solid #1e2535",
                transition: "all 0.15s",
              }}
              title="List view"
            >
              ☰
            </button>
            <button
              onClick={() => setView("card")}
              style={{
                padding: "7px 12px",
                border: "none",
                background: view === "card" ? "rgba(6,182,212,0.12)" : "transparent",
                color: view === "card" ? "#06b6d4" : "#4a5568",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.15s",
              }}
              title="Card view"
            >
              ⊞
            </button>
          </div>

          {/* New List button */}
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #0891b2, #0e7490)",
              color: "#fff",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: 0.8,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + New List
          </button>
        </div>

        {/* ── Bulk Actions Bar ─────────────────────────────────────────── */}
        {selectedCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              background: "rgba(6,182,212,0.06)",
              borderBottom: "1px solid rgba(6,182,212,0.2)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                color: "#06b6d4",
                fontWeight: 600,
              }}
            >
              {selectedCount} selected
            </span>

            <div style={{ width: 1, height: 16, background: "rgba(6,182,212,0.3)" }} />

            {[
              { label: "📋 Add to List", color: "#94a3b8" },
              { label: "📨 Send Outreach", color: "#06b6d4" },
              { label: "📤 Export", color: "#94a3b8" },
              { label: "🗑 Remove", color: "#ef4444" },
            ].map(({ label, color }) => (
              <button
                key={label}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: `1px solid ${color}40`,
                  background: `${color}10`,
                  color,
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #1e2535",
                background: "transparent",
                color: "#4a5568",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
              }}
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* ── Table / Card area ───────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: view === "card" ? "0 20px" : 0 }}>
          {/* Result count info */}
          <div
            style={{
              padding: "10px 20px 6px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid #1e2535",
            }}
          >
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
              {filtered.length} creators
            </span>
            {activeList !== "all" && (
              <>
                <span style={{ color: "#1e2535" }}>·</span>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4" }}>
                  {LISTS.find((l) => l.id === activeList)?.label}
                </span>
              </>
            )}
          </div>

          {/* Card or List view */}
          {view === "card" ? (
            <CardView />
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              {/* Table head */}
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #1e2535",
                    background: "#0a0d14",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {/* Checkbox */}
                  <th style={{ width: 36, padding: "10px 8px 10px 20px" }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked && !allChecked;
                      }}
                      onChange={toggleAll}
                      style={{ accentColor: "#06b6d4", cursor: "pointer" }}
                    />
                  </th>
                  {[
                    { label: "CREATOR", width: "22%" },
                    { label: "PLATFORM", width: "13%" },
                    { label: "FOLLOWERS", width: "11%" },
                    { label: "ENG. RATE", width: "10%" },
                    { label: "TRUST", width: "12%" },
                    { label: "STATUS", width: "12%" },
                    { label: "TAGS", width: "20%" },
                  ].map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        width,
                        padding: "10px 8px",
                        textAlign: "left",
                        fontSize: 9,
                        fontFamily: "'DM Mono', monospace",
                        color: "#4a5568",
                        letterSpacing: 1.5,
                        fontWeight: 400,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {filtered.map((creator) => (
                  <tr
                    key={creator.id}
                    onClick={() => toggleOne(creator.id)}
                    onMouseEnter={() => setHoveredRow(creator.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: "1px solid #1e2535",
                      background: selectedIds.has(creator.id)
                        ? "rgba(6,182,212,0.04)"
                        : hoveredRow === creator.id
                        ? "rgba(255,255,255,0.015)"
                        : "transparent",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "12px 8px 12px 20px" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(creator.id)}
                        onChange={() => toggleOne(creator.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ accentColor: "#06b6d4", cursor: "pointer" }}
                      />
                    </td>

                    {/* Creator */}
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: creator.avatarColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {creator.avatarInitials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: "'Syne', sans-serif",
                              fontWeight: 700,
                              color: "#e2e8f0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {creator.name}
                          </div>
                          <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
                            {creator.handle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td style={{ padding: "12px 8px" }}>
                      <PlatformBadge platform={creator.platform} />
                    </td>

                    {/* Followers */}
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "'DM Mono', monospace",
                          color: "#e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        {creator.followers}
                      </span>
                    </td>

                    {/* Engagement */}
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "'DM Mono', monospace",
                          color: "#06b6d4",
                          fontWeight: 600,
                        }}
                      >
                        {creator.engagement}
                      </span>
                    </td>

                    {/* Trust */}
                    <td style={{ padding: "12px 8px" }}>
                      <TrustBar score={creator.trustScore} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 8px" }}>
                      <StatusBadge status={creator.status} />
                    </td>

                    {/* Tags */}
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {creator.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 9,
                              fontFamily: "'DM Mono', monospace",
                              color: "#4a5568",
                              background: "#111827",
                              padding: "2px 6px",
                              borderRadius: 3,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            borderTop: "1px solid #1e2535",
            background: "#0a0d14",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
            Showing {filtered.length} of {MOCK_CREATORS.length} creators
          </span>

          {/* Pagination placeholder */}
          <div style={{ display: "flex", gap: 4 }}>
            {["prev", "1", "2", "3", "next"].map((label) => (
              <button
                key={label}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: label === "1" ? "1px solid rgba(6,182,212,0.4)" : "1px solid #1e2535",
                  background: label === "1" ? "rgba(6,182,212,0.1)" : "transparent",
                  color: label === "1" ? "#06b6d4" : "#4a5568",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  justifyContent: "center",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
