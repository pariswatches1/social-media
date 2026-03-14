"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  id: string;
  platform: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  engagementRate: number | null;
  trustScore: number | null;
  niche: string | null;
  location: string | null;
  email: string | null;
  avgLikes: number | null;
  avgComments: number | null;
  lastUpdated: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#06b6d4",
  tiktok: "#10b981",
  youtube: "#ef4444",
  twitter: "#3b82f6",
  linkedin: "#8b5cf6",
  facebook: "#1877f2",
  reddit: "#ff4500",
  pinterest: "#e60023",
  snapchat: "#fffc00",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "\u{1f4f8}",
  tiktok: "\u{1f3b5}",
  youtube: "\u25b6\ufe0f",
  twitter: "\u{1f426}",
  linkedin: "\u{1f4bc}",
  facebook: "\u{1f310}",
  reddit: "\u{1f4e2}",
  pinterest: "\u{1f4cc}",
  snapchat: "\u{1f47b}",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  reddit: "Reddit",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
};

const PLATFORM_OPTIONS = [
  "all", "instagram", "tiktok", "youtube", "twitter", "linkedin", "reddit", "facebook", "pinterest", "snapchat",
];

const CARDS_PER_PAGE = 9;

const selectStyle: Record<string, unknown> = {
  background: "#060810",
  border: "1px solid #1e2535",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#94a3b8",
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  cursor: "pointer",
  minWidth: 120,
  boxSizing: "border-box",
};

const filterInputStyle: Record<string, unknown> = {
  background: "#060810",
  border: "1px solid #1e2535",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#e2e8f0",
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  minWidth: 100,
  width: 120,
  boxSizing: "border-box",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function engagementColor(rate: number | null): string {
  if (rate === null) return "#2d3748";
  if (rate >= 5) return "#22c55e";
  if (rate >= 2) return "#f59e0b";
  return "#ef4444";
}

function trustColor(score: number | null): string {
  if (score === null) return "#2d3748";
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ["#7c3aed", "#0891b2", "#ef4444", "#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#f97316"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Creator Card ─────────────────────────────────────────────────────────────

function CreatorCard({ creator }: { creator: Creator }) {
  const [addedToList, setAddedToList] = useState(false);
  const [hoverAdd, setHoverAdd] = useState(false);
  const [hoverView, setHoverView] = useState(false);

  const engColor = engagementColor(creator.engagementRate);
  const tColor = trustColor(creator.trustScore);
  const platColor = PLATFORM_COLORS[creator.platform] || "#94a3b8";
  const platIcon = PLATFORM_ICONS[creator.platform] || "\u{1f310}";
  const platLabel = PLATFORM_LABELS[creator.platform] || creator.platform;
  const displayName = creator.displayName || creator.handle;
  const handle = creator.handle.startsWith("@") ? creator.handle : `@${creator.handle}`;

  function handleAddToList() {
    setAddedToList(true);
    alert(`"${displayName}" added to list (list selector coming soon)`);
    setTimeout(() => setAddedToList(false), 2000);
  }

  function handleViewProfile() {
    alert(`Profile view for ${displayName} coming soon`);
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
        {creator.avatarUrl ? (
          <img
            src={creator.avatarUrl}
            alt={displayName}
            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: getAvatarColor(displayName),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {getInitials(displayName)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
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
            {handle}
          </div>
        </div>

        {/* Platform badge */}
        <div
          style={{
            padding: "3px 8px",
            borderRadius: 6,
            background: `${platColor}15`,
            border: `1px solid ${platColor}33`,
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: platColor,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span>{platIcon}</span>
          <span>{platLabel}</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Followers */}
        <div style={{ background: "#060810", borderRadius: 8, padding: "8px 10px", border: "1px solid #1e2535" }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1.5, marginBottom: 4 }}>
            FOLLOWERS
          </div>
          <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0" }}>
            {formatFollowers(creator.followerCount)}
          </div>
        </div>

        {/* Engagement */}
        <div style={{ background: "#060810", borderRadius: 8, padding: "8px 10px", border: "1px solid #1e2535" }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1.5, marginBottom: 4 }}>
            ENGAGEMENT
          </div>
          <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: engColor, display: "flex", alignItems: "center", gap: 5 }}>
            {creator.engagementRate !== null ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: engColor, display: "inline-block", flexShrink: 0 }} />
                {creator.engagementRate.toFixed(1)}%
              </>
            ) : (
              <span style={{ color: "#2d3748" }}>{"\u2014"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1.5 }}>
            TRUST SCORE
          </div>
          <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: tColor, fontWeight: 700 }}>
            {creator.trustScore !== null ? creator.trustScore : "\u2014"}
          </div>
        </div>
        <div style={{ width: "100%", height: 4, background: "#1e2535", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              width: `${creator.trustScore || 0}%`,
              height: "100%",
              background: tColor,
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {creator.niche && (
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
        )}
        {creator.location && (
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
            {"\u{1f4cd}"} {creator.location}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleAddToList}
          onMouseEnter={() => setHoverAdd(true)}
          onMouseLeave={() => setHoverAdd(false)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 8,
            border: `1px solid ${addedToList ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
            background: addedToList ? "rgba(6,182,212,0.1)" : hoverAdd ? "#1e2535" : "transparent",
            color: addedToList ? "#06b6d4" : "#94a3b8",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            transition: "all 0.15s",
            letterSpacing: 0.5,
          }}
        >
          {addedToList ? "\u2713 ADDED" : "+ ADD TO LIST"}
        </button>
        <button
          onClick={handleViewProfile}
          onMouseEnter={() => setHoverView(true)}
          onMouseLeave={() => setHoverView(false)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 8,
            border: "none",
            background: hoverView ? "linear-gradient(135deg, #0e7490, #0891b2)" : "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            transition: "all 0.15s",
            letterSpacing: 0.5,
          }}
        >
          VIEW PROFILE {"\u2192"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { user } = useUser();

  // Data
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [minEngagement, setMinEngagement] = useState("");
  const [minTrust, setMinTrust] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCreators = useCallback(async (page: number) => {
    try {
      setError(null);
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (nicheFilter.trim()) params.set("niche", nicheFilter.trim());
      if (minFollowers.trim()) {
        const val = parseInt(minFollowers);
        if (!isNaN(val) && val > 0) params.set("minFollowers", String(val));
      }
      if (minEngagement.trim()) {
        const val = parseFloat(minEngagement);
        if (!isNaN(val) && val > 0) params.set("minEngagement", String(val));
      }
      if (minTrust.trim()) {
        const val = parseInt(minTrust);
        if (!isNaN(val) && val > 0) params.set("minTrust", String(val));
      }
      params.set("page", String(page));
      params.set("limit", String(CARDS_PER_PAGE));

      const res = await fetch(`/api/creators/search?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to search creators (${res.status})`);

      const data = await res.json();
      setCreators(data.creators || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to search creators";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, platformFilter, nicheFilter, minFollowers, minEngagement, minTrust]);

  useEffect(() => {
    fetchCreators(currentPage);
  }, [fetchCreators, currentPage]);

  // ── Search handler ─────────────────────────────────────────────────────────

  function handleSearch() {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  }

  function handleSearchKeyDown(e: { key: string }) {
    if (e.key === "Enter") handleSearch();
  }

  function handleFilterChange() {
    setCurrentPage(1);
  }

  function clearAllFilters() {
    setSearchInput("");
    setSearchQuery("");
    setPlatformFilter("all");
    setNicheFilter("");
    setMinFollowers("");
    setMinEngagement("");
    setMinTrust("");
    setCurrentPage(1);
  }

  const hasActiveFilters = searchQuery || platformFilter !== "all" || nicheFilter || minFollowers || minEngagement || minTrust;

  // ── Loading State ──────────────────────────────────────────────────────────

  if (isLoading && creators.length === 0) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header shimmer */}
        <div style={{ marginBottom: 24 }}>
          <div className="shimmer" style={{ height: 28, width: 260, borderRadius: 6, marginBottom: 8 }} />
          <div className="shimmer" style={{ height: 14, width: 300, borderRadius: 4 }} />
        </div>
        {/* Search bar shimmer */}
        <div className="shimmer" style={{ height: 48, borderRadius: 10, marginBottom: 16 }} />
        {/* Filter row shimmer */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="shimmer" style={{ height: 36, width: 120, borderRadius: 8 }} />
          ))}
        </div>
        {/* Cards shimmer */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer" style={{ height: 300, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────

  if (error && creators.length === 0) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", paddingTop: 120 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>{"\u26a0\ufe0f"}</div>
        <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
          Unable to load creators
        </h2>
        <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
          {error}
        </p>
        <button
          onClick={() => fetchCreators(currentPage)}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <span>{"\u{1f50d}"}</span> Discover Creators
          </h1>
          <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", margin: 0 }}>
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
            {"\u2715"} CLEAR FILTERS
          </button>
        )}
      </div>

      {/* ── Search Bar ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none", zIndex: 1 }}>
            {"\u{1f50d}"}
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search creators by name, niche, or keyword..."
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
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1e2535")}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{
            padding: "14px 24px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff",
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Search
        </button>
      </div>

      {/* ── Filter Row ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28, alignItems: "center" }}>
        {/* Platform dropdown */}
        <div style={{ position: "relative" }}>
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              handleFilterChange();
            }}
            style={{
              ...selectStyle,
              color: platformFilter !== "all" ? "#e2e8f0" : "#4a5568",
              borderColor: platformFilter !== "all" ? "rgba(6,182,212,0.3)" : "#1e2535",
              appearance: "none" as const,
              paddingRight: 28,
            } as React.CSSProperties}
          >
            <option value="all">All Platforms</option>
            {PLATFORM_OPTIONS.filter((p) => p !== "all").map((p) => (
              <option key={p} value={p}>{PLATFORM_LABELS[p] || p}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#4a5568", pointerEvents: "none" }}>
            {"\u25bc"}
          </span>
        </div>

        {/* Niche */}
        <input
          type="text"
          value={nicheFilter}
          onChange={(e) => {
            setNicheFilter(e.target.value);
            handleFilterChange();
          }}
          placeholder="Niche"
          style={{
            ...filterInputStyle,
            borderColor: nicheFilter ? "rgba(6,182,212,0.3)" : "#1e2535",
          } as React.CSSProperties}
        />

        {/* Min Followers */}
        <input
          type="number"
          value={minFollowers}
          onChange={(e) => {
            setMinFollowers(e.target.value);
            handleFilterChange();
          }}
          placeholder="Min Followers"
          style={{
            ...filterInputStyle,
            width: 130,
            borderColor: minFollowers ? "rgba(6,182,212,0.3)" : "#1e2535",
          } as React.CSSProperties}
        />

        {/* Min Engagement */}
        <input
          type="number"
          value={minEngagement}
          onChange={(e) => {
            setMinEngagement(e.target.value);
            handleFilterChange();
          }}
          placeholder="Min Eng %"
          step="0.1"
          style={{
            ...filterInputStyle,
            borderColor: minEngagement ? "rgba(6,182,212,0.3)" : "#1e2535",
          } as React.CSSProperties}
        />

        {/* Min Trust */}
        <input
          type="number"
          value={minTrust}
          onChange={(e) => {
            setMinTrust(e.target.value);
            handleFilterChange();
          }}
          placeholder="Min Trust"
          style={{
            ...filterInputStyle,
            borderColor: minTrust ? "rgba(6,182,212,0.3)" : "#1e2535",
          } as React.CSSProperties}
        />
      </div>

      {/* ── Results Count ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
          {isLoading ? (
            <span style={{ color: "#2d3748" }}>Searching...</span>
          ) : (
            <>
              <span style={{ color: "#06b6d4", fontWeight: 700, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>{total}</span>
              {" "}creator{total !== 1 ? "s" : ""} found
            </>
          )}
        </div>
        {totalPages > 1 && !isLoading && (
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748" }}>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* ── Creator Grid ── */}
      {!isLoading && creators.length === 0 ? (
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>{"\u{1f50d}"}</div>
          <div style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
            No creators found
          </div>
          <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 16, lineHeight: 1.6 }}>
            No creators found matching your filters.<br />
            Try adjusting your search criteria.
          </div>
          {hasActiveFilters && (
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
          )}
        </div>
      ) : (
        <>
          {/* Loading overlay for subsequent searches */}
          <div style={{ position: "relative", opacity: isLoading ? 0.5 : 1, transition: "opacity 0.2s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 40 }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #1e2535",
                  background: "transparent",
                  color: currentPage <= 1 ? "#2d3748" : "#94a3b8",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {"\u2190"} PREV
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={isLoading}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: isActive ? "1px solid rgba(6,182,212,0.4)" : "1px solid #1e2535",
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
                disabled={currentPage >= totalPages || isLoading}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #1e2535",
                  background: "transparent",
                  color: currentPage >= totalPages ? "#2d3748" : "#94a3b8",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                NEXT {"\u2192"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
