"use client";

import { useState, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────────────

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube" | "x" | "linkedin";
  avatar_color: string;
  followers: number;
  engagement_rate: number;
  trust_score: number;
  niche: string;
  location: string;
  verified: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────────────────

const MOCK_CREATORS: Creator[] = [
  {
    id: "1",
    name: "Aria Chen",
    handle: "ariachen",
    platform: "instagram",
    avatar_color: "#7c3aed",
    followers: 1240000,
    engagement_rate: 6.8,
    trust_score: 92,
    niche: "Fashion",
    location: "New York, US",
    verified: true,
  },
  {
    id: "2",
    name: "Marcus Volta",
    handle: "marcusvolta",
    platform: "tiktok",
    avatar_color: "#0891b2",
    followers: 3800000,
    engagement_rate: 12.4,
    trust_score: 87,
    niche: "Fitness",
    location: "Los Angeles, US",
    verified: true,
  },
  {
    id: "3",
    name: "Priya Nair",
    handle: "priyacooks",
    platform: "youtube",
    avatar_color: "#dc2626",
    followers: 892000,
    engagement_rate: 4.1,
    trust_score: 78,
    niche: "Food",
    location: "London, UK",
    verified: false,
  },
  {
    id: "4",
    name: "Jake Reeves",
    handle: "jakereeves",
    platform: "tiktok",
    avatar_color: "#ea580c",
    followers: 560000,
    engagement_rate: 9.3,
    trust_score: 81,
    niche: "Gaming",
    location: "Toronto, CA",
    verified: true,
  },
  {
    id: "5",
    name: "Sofia Laurent",
    handle: "sofialaurent",
    platform: "instagram",
    avatar_color: "#db2777",
    followers: 285000,
    engagement_rate: 3.7,
    trust_score: 69,
    niche: "Beauty",
    location: "Paris, FR",
    verified: false,
  },
  {
    id: "6",
    name: "Deven Patel",
    handle: "devenpatel",
    platform: "youtube",
    avatar_color: "#059669",
    followers: 2100000,
    engagement_rate: 5.6,
    trust_score: 94,
    niche: "Tech",
    location: "San Francisco, US",
    verified: true,
  },
  {
    id: "7",
    name: "Mia Torres",
    handle: "miatravels",
    platform: "instagram",
    avatar_color: "#0284c7",
    followers: 178000,
    engagement_rate: 7.2,
    trust_score: 75,
    niche: "Travel",
    location: "Barcelona, ES",
    verified: false,
  },
  {
    id: "8",
    name: "Leo Hammond",
    handle: "leohammond",
    platform: "x",
    avatar_color: "#64748b",
    followers: 430000,
    engagement_rate: 2.1,
    trust_score: 62,
    niche: "Business",
    location: "Austin, US",
    verified: true,
  },
  {
    id: "9",
    name: "Yuki Tanaka",
    handle: "yukitanaka",
    platform: "tiktok",
    avatar_color: "#9333ea",
    followers: 6700000,
    engagement_rate: 15.8,
    trust_score: 89,
    niche: "Music",
    location: "Tokyo, JP",
    verified: true,
  },
  {
    id: "10",
    name: "Camille Dubois",
    handle: "camilledubois",
    platform: "linkedin",
    avatar_color: "#1d4ed8",
    followers: 95000,
    engagement_rate: 1.4,
    trust_score: 88,
    niche: "Business",
    location: "Amsterdam, NL",
    verified: true,
  },
  {
    id: "11",
    name: "Ryan Okafor",
    handle: "ryanokafor",
    platform: "youtube",
    avatar_color: "#b45309",
    followers: 1550000,
    engagement_rate: 4.9,
    trust_score: 83,
    niche: "Lifestyle",
    location: "Lagos, NG",
    verified: true,
  },
  {
    id: "12",
    name: "Zoe Bright",
    handle: "zoebright",
    platform: "instagram",
    avatar_color: "#be185d",
    followers: 68000,
    engagement_rate: 8.5,
    trust_score: 44,
    niche: "Fitness",
    location: "Sydney, AU",
    verified: false,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────────────────

const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  x: "✖️",
  linkedin: "💼",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  linkedin: "LinkedIn",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  tiktok: "#69c9d0",
  youtube: "#ff0000",
  x: "#94a3b8",
  linkedin: "#0a66c2",
};

const FOLLOWER_RANGES = [
  { label: "1K–10K", min: 1000, max: 10000 },
  { label: "10K–50K", min: 10000, max: 50000 },
  { label: "50K–100K", min: 50000, max: 100000 },
  { label: "100K–500K", min: 100000, max: 500000 },
  { label: "500K–1M", min: 500000, max: 1000000 },
  { label: "1M+", min: 1000000, max: Infinity },
];

const ENGAGEMENT_RATES = [
  { label: ">1%", min: 1 },
  { label: ">3%", min: 3 },
  { label: ">5%", min: 5 },
  { label: ">10%", min: 10 },
];

const NICHES = [
  "Fashion", "Beauty", "Fitness", "Food", "Tech",
  "Gaming", "Travel", "Lifestyle", "Business", "Music",
];

const TRUST_SCORES = [
  { label: ">50", min: 50 },
  { label: ">70", min: 70 },
  { label: ">90", min: 90 },
];

const PLATFORMS = ["all", "instagram", "tiktok", "youtube", "x", "linkedin"];

const CARDS_PER_PAGE = 9;

// ─── Helpers ─────────────────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function engagementColor(rate: number): string {
  if (rate >= 5) return "#22c55e";
  if (rate >= 2) return "#f59e0b";
  return "#ef4444";
}

function trustColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ─── Sub-components ─────────────────────────────────────────────────────────────────────────────

function CreatorCard({
  creator,
  onAddToList,
  onViewProfile,
}: {
  creator: Creator;
  onAddToList: (id: string) => void;
  onViewProfile: (id: string) => void;
}) {
  const [addedToList, setAddedToList] = useState(false);
  const [hoverAdd, setHoverAdd] = useState(false);
  const [hoverView, setHoverView] = useState(false);

  const engColor = engagementColor(creator.engagement_rate);
  const tColor = trustColor(creator.trust_score);

  function handleAdd() {
    setAddedToList(true);
    onAddToList(creator.id);
    setTimeout(() => setAddedToList(false), 2000);
  }

  return (
    <div
      style={{
        background: "#0a0d14",
        border: "1px solid #1e2535",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.2s",
      }}
    >
      {/* Top row: avatar + name + platform */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: creator.avatar_color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {creator.name.charAt(0)}
        </div>

        {/* Name + handle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {creator.name}
            {creator.verified && (
              <span style={{ color: "#06b6d4", fontSize: 12 }}>✓</span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{creator.handle}
          </div>
        </div>

        {/* Platform badge */}
        <div
          style={{
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(30,37,53,0.8)",
            border: `1px solid ${PLATFORM_COLORS[creator.platform]}33`,
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: PLATFORM_COLORS[creator.platform],
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span>{PLATFORM_EMOJIS[creator.platform]}</span>
          <span>{PLATFORM_LABELS[creator.platform]}</span>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {/* Followers */}
        <div
          style={{
            background: "#060810",
            borderRadius: 8,
            padding: "8px 10px",
            border: "1px solid #1e2535",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              letterSpacing: 1.5,
              marginBottom: 4,
            }}
          >
            FOLLOWERS
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e2e8f0",
            }}
          >
            {formatFollowers(creator.followers)}
          </div>
        </div>

        {/* Engagement */}
        <div
          style={{
            background: "#060810",
            borderRadius: 8,
            padding: "8px 10px",
            border: "1px solid #1e2535",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              letterSpacing: 1.5,
              marginBottom: 4,
            }}
          >
            ENGAGEMENT
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: engColor,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: engColor,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {creator.engagement_rate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              letterSpacing: 1.5,
            }}
          >
            TRUST SCORE
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: tColor,
              fontWeight: 700,
            }}
          >
            {creator.trust_score}
          </div>
        </div>
        {/* Bar */}
        <div
          style={{
            width: "100%",
            height: 4,
            background: "#1e2535",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${creator.trust_score}%`,
              height: "100%",
              background: tColor,
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Tags row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap" as const,
        }}
      >
        {/* Niche */}
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 20,
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.2)",
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            color: "#06b6d4",
            letterSpacing: 0.5,
          }}
        >
          {creator.niche}
        </span>
        {/* Location */}
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 20,
            background: "#060810",
            border: "1px solid #1e2535",
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            color: "#4a5568",
          }}
        >
          📍 {creator.location}
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleAdd}
          onMouseEnter={() => setHoverAdd(true)}
          onMouseLeave={() => setHoverAdd(false)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 8,
            border: `1px solid ${addedToList ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
            background: addedToList
              ? "rgba(6,182,212,0.1)"
              : hoverAdd
              ? "#1e2535"
              : "transparent",
            color: addedToList ? "#06b6d4" : "#94a3b8",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            transition: "all 0.15s",
            letterSpacing: 0.5,
          }}
        >
          {addedToList ? "✓ ADDED" : "+ ADD TO LIST"}
        </button>
        <button
          onClick={() => onViewProfile(creator.id)}
          onMouseEnter={() => setHoverView(true)}
          onMouseLeave={() => setHoverView(false)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 8,
            border: "none",
            background: hoverView
              ? "linear-gradient(135deg, #0e7490, #0891b2)"
              : "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            transition: "all 0.15s",
            letterSpacing: 0.5,
          }}
        >
          VIEW PROFILE →
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlatform, setActivePlatform] = useState("all");
  const [followerRange, setFollowerRange] = useState("");
  const [engagementFilter, setEngagementFilter] = useState("");
  const [nicheFilter, setNicheFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [trustFilter, setTrustFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Filtering ──────────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let results = [...MOCK_CREATORS];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.niche.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    // Platform
    if (activePlatform !== "all") {
      results = results.filter((c) => c.platform === activePlatform);
    }

    // Follower range
    if (followerRange) {
      const range = FOLLOWER_RANGES.find((r) => r.label === followerRange);
      if (range) {
        results = results.filter(
          (c) => c.followers >= range.min && c.followers < range.max
        );
      }
    }

    // Engagement rate
    if (engagementFilter) {
      const eng = ENGAGEMENT_RATES.find((e) => e.label === engagementFilter);
      if (eng) {
        results = results.filter((c) => c.engagement_rate >= eng.min);
      }
    }

    // Niche
    if (nicheFilter) {
      results = results.filter((c) => c.niche === nicheFilter);
    }

    // Location
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      results = results.filter((c) => c.location.toLowerCase().includes(loc));
    }

    // Trust score
    if (trustFilter) {
      const trust = TRUST_SCORES.find((t) => t.label === trustFilter);
      if (trust) {
        results = results.filter((c) => c.trust_score >= trust.min);
      }
    }

    return results;
  }, [
    searchQuery,
    activePlatform,
    followerRange,
    engagementFilter,
    nicheFilter,
    locationFilter,
    trustFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE
  );

  // Reset to page 1 when filters change
  function handleFilterChange<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setCurrentPage(1);
  }

  function clearAllFilters() {
    setSearchQuery("");
    setActivePlatform("all");
    setFollowerRange("");
    setEngagementFilter("");
    setNicheFilter("");
    setLocationFilter("");
    setTrustFilter("");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    searchQuery ||
    activePlatform !== "all" ||
    followerRange ||
    engagementFilter ||
    nicheFilter ||
    locationFilter ||
    trustFilter;

  const selectStyle: React.CSSProperties = {
    background: "#060810",
    border: "1px solid #1e2535",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    cursor: "pointer",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    paddingRight: 28,
    minWidth: 140,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e2e8f0",
              marginBottom: 4,
            }}
          >
            Creator Discovery
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#4a5568",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Find & vet influencers across every platform
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #1e2535",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            ✕ CLEAR FILTERS
          </button>
        )}
      </div>

      {/* ── Search Bar ── */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 16,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            handleFilterChange(setSearchQuery, e.target.value)
          }
          placeholder="Search 350M+ creators by name, niche, or keyword..."
          style={{
            width: "100%",
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 10,
            padding: "14px 16px 14px 46px",
            color: "#e2e8f0",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)")
          }
          onBlur={(e) => (e.currentTarget.style.borderColor = "#1e2535")}
        />
      </div>

      {/* ── Platform Pills ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap" as const,
          marginBottom: 14,
        }}
      >
        {PLATFORMS.map((p) => {
          const isActive = activePlatform === p;
          return (
            <button
              key={p}
              onClick={() => handleFilterChange(setActivePlatform, p)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: isActive
                  ? "1px solid rgba(6,182,212,0.4)"
                  : "1px solid #1e2535",
                background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                color: isActive ? "#06b6d4" : "#94a3b8",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 5,
                letterSpacing: 0.3,
              }}
            >
              {p !== "all" && <span>{PLATFORM_EMOJIS[p]}</span>}
              {p === "all"
                ? "All"
                : PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS]}
            </button>
          );
        })}
      </div>

      {/* ── Filter Dropdowns Row ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap" as const,
          marginBottom: 28,
          alignItems: "center",
        }}
      >
        {/* Follower Range */}
        <div style={{ position: "relative" }}>
          <select
            value={followerRange}
            onChange={(e) =>
              handleFilterChange(setFollowerRange, e.target.value)
            }
            style={{
              ...selectStyle,
              color: followerRange ? "#e2e8f0" : "#4a5568",
              borderColor: followerRange ? "rgba(6,182,212,0.3)" : "#1e2535",
            }}
          >
            <option value="">Follower Range</option>
            {FOLLOWER_RANGES.map((r) => (
              <option key={r.label} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "#4a5568",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        </div>

        {/* Engagement Rate */}
        <div style={{ position: "relative" }}>
          <select
            value={engagementFilter}
            onChange={(e) =>
              handleFilterChange(setEngagementFilter, e.target.value)
            }
            style={{
              ...selectStyle,
              color: engagementFilter ? "#e2e8f0" : "#4a5568",
              borderColor: engagementFilter
                ? "rgba(6,182,212,0.3)"
                : "#1e2535",
            }}
          >
            <option value="">Engagement Rate</option>
            {ENGAGEMENT_RATES.map((r) => (
              <option key={r.label} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "#4a5568",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        </div>

        {/* Niche */}
        <div style={{ position: "relative" }}>
          <select
            value={nicheFilter}
            onChange={(e) =>
              handleFilterChange(setNicheFilter, e.target.value)
            }
            style={{
              ...selectStyle,
              color: nicheFilter ? "#e2e8f0" : "#4a5568",
              borderColor: nicheFilter ? "rgba(6,182,212,0.3)" : "#1e2535",
            }}
          >
            <option value="">Niche</option>
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "#4a5568",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        </div>

        {/* Location */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) =>
              handleFilterChange(setLocationFilter, e.target.value)
            }
            placeholder="Location"
            style={{
              ...selectStyle,
              minWidth: 130,
              paddingRight: 12,
              color: locationFilter ? "#e2e8f0" : "#4a5568",
              borderColor: locationFilter
                ? "rgba(6,182,212,0.3)"
                : "#1e2535",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = locationFilter
                ? "rgba(6,182,212,0.3)"
                : "#1e2535")
            }
          />
        </div>

        {/* Trust Score */}
        <div style={{ position: "relative" }}>
          <select
            value={trustFilter}
            onChange={(e) =>
              handleFilterChange(setTrustFilter, e.target.value)
            }
            style={{
              ...selectStyle,
              color: trustFilter ? "#e2e8f0" : "#4a5568",
              borderColor: trustFilter ? "rgba(6,182,212,0.3)" : "#1e2535",
            }}
          >
            <option value="">Trust Score</option>
            {TRUST_SCORES.map((t) => (
              <option key={t.label} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "#4a5568",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* ── Stats Banner ── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap" as const,
          alignItems: "center",
        }}
      >
        {[
          { label: "PROFILES", value: "350M+" },
          { label: "NICHES", value: "142" },
          { label: "COUNTRIES", value: "190+" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 8,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: "#06b6d4",
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'DM Mono', monospace",
                color: "#4a5568",
                letterSpacing: 2,
              }}
            >
              {label}
            </span>
          </div>
        ))}

        <div
          style={{
            marginLeft: "auto",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            color: "#4a5568",
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* ── Creator Grid ── */}
      {paginated.length === 0 ? (
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div
            style={{
              fontSize: 15,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 8,
            }}
          >
            No creators found
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              marginBottom: 16,
            }}
          >
            Try adjusting your search or filters
          </div>
          <button
            onClick={clearAllFilters}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #1e2535",
              background: "transparent",
              color: "#06b6d4",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            CLEAR ALL FILTERS
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {paginated.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onAddToList={(id) => console.log("Add to list:", id)}
              onViewProfile={(id) => console.log("View profile:", id)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginBottom: 40,
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #1e2535",
              background: "transparent",
              color: safePage === 1 ? "#2d3748" : "#94a3b8",
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              cursor: safePage === 1 ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            ← PREV
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === safePage;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: isActive
                    ? "1px solid rgba(6,182,212,0.4)"
                    : "1px solid #1e2535",
                  background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                  color: isActive ? "#06b6d4" : "#94a3b8",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #1e2535",
              background: "transparent",
              color: safePage === totalPages ? "#2d3748" : "#94a3b8",
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              cursor: safePage === totalPages ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}