"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

// ─── Types ──────────────────────────────────────────────────────────────────

type OutreachStatus = "DRAFT" | "SENT" | "OPENED" | "REPLIED" | "BOUNCED";

interface Creator {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  platform: string;
  email: string | null;
}

interface OutreachEmail {
  id: string;
  subject: string;
  body: string;
  status: OutreachStatus;
  sentAt: string | null;
  openedAt: string | null;
  repliedAt: string | null;
  createdAt: string;
  creator: Creator;
}

interface OutreachStats {
  total: number;
  sent: number;
  opened: number;
  replied: number;
  drafts: number;
  responseRate: number;
}

interface CreatorSearchResult {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  platform: string;
  email: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<OutreachStatus, string> = {
  DRAFT: "#4a5568",
  SENT: "#3b82f6",
  OPENED: "#f59e0b",
  REPLIED: "#10b981",
  BOUNCED: "#ef4444",
};

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎤",
  youtube: "▶️",
  twitter: "𝕏",
  linkedin: "💼",
  facebook: "📘",
  reddit: "🔴",
  pinterest: "📌",
  snapchat: "👻",
};

const ITEMS_PER_PAGE = 20;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#06b6d4",
    "#8b5cf6",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
  ];
  return colors[Math.abs(hash) % colors.length];
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function OutreachPage() {
  const { user } = useUser();
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OutreachStatus>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Compose modal state
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeCreatorId, setComposeCreatorId] = useState("");
  const [composeCreatorLabel, setComposeCreatorLabel] = useState("");
  const [creatorSearch, setCreatorSearch] = useState("");
  const [creatorResults, setCreatorResults] = useState<CreatorSearchResult[]>(
    []
  );
  const [searchingCreators, setSearchingCreators] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<OutreachEmail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Emails ───────────────────────────────────────────────────────

  const fetchEmails = useCallback(
    async (page: number) => {
      try {
        setError(null);
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filter !== "all") params.set("status", filter);
        params.set("page", String(page));
        params.set("limit", String(ITEMS_PER_PAGE));
        const res = await fetch(`/api/outreach?${params.toString()}`);
        if (!res.ok)
          throw new Error(`Failed to load outreach data (${res.status})`);
        const data = await res.json();
        setEmails(data.emails || []);
        setStats(data.stats || null);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load outreach data";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchEmails(1);
  }, [fetchEmails]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    fetchEmails(page);
  }

  // ─── Creator Search for Compose ─────────────────────────────────────────

  useEffect(() => {
    if (!creatorSearch.trim() || creatorSearch.length < 2) {
      setCreatorResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingCreators(true);
      try {
        const res = await fetch(
          `/api/creators/search?q=${encodeURIComponent(creatorSearch.trim())}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setCreatorResults(data.creators || []);
        }
      } catch {
        // Silently fail — dropdown just stays empty
      } finally {
        setSearchingCreators(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [creatorSearch]);

  function selectCreator(c: CreatorSearchResult) {
    setComposeCreatorId(c.id);
    setComposeCreatorLabel(
      `${c.displayName || c.handle} (${c.platform})${c.email ? ` — ${c.email}` : ""}`
    );
    setCreatorSearch("");
    setCreatorResults([]);
  }

  // ─── Compose Handlers ───────────────────────────────────────────────────

  function resetCompose() {
    setComposeSubject("");
    setComposeBody("");
    setComposeCreatorId("");
    setComposeCreatorLabel("");
    setCreatorSearch("");
    setCreatorResults([]);
    setShowCompose(false);
  }

  async function handleSaveDraft() {
    if (!composeCreatorId) {
      alert("Please select a creator.");
      return;
    }
    if (!composeSubject.trim()) {
      alert("Please enter a subject.");
      return;
    }
    if (!composeBody.trim()) {
      alert("Please enter a message body.");
      return;
    }
    setIsSavingDraft(true);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: composeCreatorId,
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          send: false,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save draft");
      }
      resetCompose();
      fetchEmails(1);
      setCurrentPage(1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSend() {
    if (!composeCreatorId) {
      alert("Please select a creator.");
      return;
    }
    if (!composeSubject.trim()) {
      alert("Please enter a subject.");
      return;
    }
    if (!composeBody.trim()) {
      alert("Please enter a message body.");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: composeCreatorId,
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          send: true,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to send email");
      }
      resetCompose();
      fetchEmails(1);
      setCurrentPage(1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsSending(false);
    }
  }

  // ─── Delete Handler ───────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/outreach/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete email");
      }
      setDeleteTarget(null);
      fetchEmails(currentPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete email");
    } finally {
      setIsDeleting(false);
    }
  }

  // ─── Client-side search filter ──────────────────────────────────────────

  const displayed = search.trim()
    ? emails.filter(
        (e) =>
          (e.creator.displayName || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase()) ||
          e.creator.handle.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  // ─── Filter tabs with counts from stats ─────────────────────────────────

  const filters: { label: string; value: "all" | OutreachStatus }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "DRAFT" },
    { label: "Sent", value: "SENT" },
    { label: "Opened", value: "OPENED" },
    { label: "Replied", value: "REPLIED" },
    { label: "Bounced", value: "BOUNCED" },
  ];

  function getFilterCount(v: "all" | OutreachStatus): number | null {
    if (!stats) return null;
    if (v === "all") return stats.total;
    if (v === "DRAFT") return stats.drafts;
    if (v === "SENT") return stats.sent;
    if (v === "OPENED") return stats.opened;
    if (v === "REPLIED") return stats.replied;
    return null;
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (isLoading && emails.length === 0) {
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
            <span style={{ fontSize: 22 }}>✉️</span>
            <h1
              style={{
                fontSize: 22,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: "#e2e8f0",
                margin: 0,
              }}
            >
              Outreach
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            Loading your outreach data...
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="shimmer"
              style={{
                height: 90,
                borderRadius: 12,
                background: "#0a0d14",
              }}
            />
          ))}
        </div>
        <div
          className="shimmer"
          style={{ height: 44, borderRadius: 8, marginBottom: 16 }}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="shimmer"
            style={{
              height: 56,
              borderRadius: 8,
              marginBottom: 4,
              background: "#0a0d14",
            }}
          />
        ))}
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (error && emails.length === 0) {
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
            <span style={{ fontSize: 22 }}>✉️</span>
            <h1
              style={{
                fontSize: 22,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: "#e2e8f0",
                margin: 0,
              }}
            >
              Outreach
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
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 14 }}>
            {error}
          </p>
          <button
            onClick={() => fetchEmails(1)}
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

  // ─── Main Render ────────────────────────────────────────────────────────

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
          <span style={{ fontSize: 22 }}>✉️</span>
          <h1
            style={{
              fontSize: 22,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Outreach
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Manage creator outreach emails. Track opens, replies, and build
          relationships.
        </p>
      </div>

      {/* Stats Row — 5 cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "TOTAL EMAILS",
            value: stats?.total ?? 0,
            icon: "📨",
          },
          { label: "SENT", value: stats?.sent ?? 0, icon: "✉️" },
          { label: "OPENED", value: stats?.opened ?? 0, icon: "👁️" },
          { label: "REPLIED", value: stats?.replied ?? 0, icon: "💬" },
          {
            label: "RESPONSE RATE",
            value: `${stats?.responseRate ?? 0}%`,
            icon: "📊",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: "#4a5568",
                    letterSpacing: 2,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    color: "#06b6d4",
                    marginTop: 4,
                  }}
                >
                  {s.value}
                </div>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {filters.map((f) => {
            const isActive = filter === f.value;
            const count = getFilterCount(f.value);
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: `1px solid ${isActive ? "rgba(6,182,212,0.3)" : "#1e2535"}`,
                  background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                  color: isActive ? "#06b6d4" : "#4a5568",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {f.label}
                {count !== null && (
                  <span
                    style={{
                      fontSize: 9,
                      color: isActive ? "#06b6d4" : "#2d3748",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search outreach..."
            style={{
              background: "#060810",
              border: "1px solid #1e2535",
              borderRadius: 8,
              padding: "8px 14px",
              color: "#e2e8f0",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              width: 220,
              outline: "none",
            }}
          />
          <button
            onClick={() => setShowCompose(true)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "linear-gradient(135deg, #0891b2, #0e7490)",
              color: "#0a1e3d",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: 0.5,
              border: "none",
              cursor: "pointer",
            }}
          >
            ✍️ Compose
          </button>
        </div>
      </div>

      {/* Outreach Table */}
      <div
        style={{
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 12,
          overflow: "hidden",
          opacity: isLoading ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 100px 100px 100px 80px",
            padding: "12px 20px",
            borderBottom: "1px solid #1e2535",
            background: "#060810",
          }}
        >
          {["Creator", "Subject", "Status", "Sent", "Date", ""].map((h) => (
            <div
              key={h || "actions"}
              style={{
                fontSize: 9,
                fontFamily: "'DM Mono', monospace",
                color: "#2d3748",
                letterSpacing: 2,
              }}
            >
              {h.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {displayed.map((o, i) => (
          <div
            key={o.id}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr 100px 100px 100px 80px",
              padding: "14px 20px",
              borderBottom:
                i < displayed.length - 1 ? "1px solid #1e2535" : "none",
              background: i % 2 === 0 ? "#0a0d14" : "#060810",
              alignItems: "center",
              transition: "background 0.1s",
            }}
          >
            {/* Creator */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              {o.creator.avatarUrl ? (
                <img
                  src={o.creator.avatarUrl}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: getAvatarColor(
                      o.creator.displayName || o.creator.handle
                    ),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(
                    o.creator.displayName || o.creator.handle
                  )}
                </div>
              )}
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#e2e8f0",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {o.creator.displayName || o.creator.handle}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#4a5568",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {PLATFORM_EMOJI[o.creator.platform.toLowerCase()] || "📱"}{" "}
                  @{o.creator.handle}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingRight: 16,
              }}
            >
              {o.subject}
            </div>

            {/* Status */}
            <div>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 1.5,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: `${STATUS_COLORS[o.status]}15`,
                  color: STATUS_COLORS[o.status],
                  border: `1px solid ${STATUS_COLORS[o.status]}30`,
                }}
              >
                {o.status}
              </span>
            </div>

            {/* Sent */}
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {formatDate(o.sentAt)}
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: 11,
                color: "#4a5568",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {formatDate(o.createdAt)}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteTarget(o)}
                title="Delete"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1px solid #1e2535",
                  background: "transparent",
                  color: "#4a5568",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#4a5568";
                  e.currentTarget.style.borderColor = "#1e2535";
                }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {displayed.length === 0 && !isLoading && (
          <div
            style={{
              padding: 60,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
            <div
              style={{
                fontSize: 15,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 6,
              }}
            >
              {search.trim()
                ? "No emails match your search"
                : filter !== "all"
                  ? `No ${filter.toLowerCase()} emails`
                  : "No outreach emails yet"}
            </div>
            <div
              style={{ fontSize: 13, color: "#4a5568", marginBottom: 16 }}
            >
              {search.trim()
                ? "Try a different search term."
                : "No outreach emails yet. Compose your first message to start connecting with creators."}
            </div>
            {!search.trim() && filter === "all" && (
              <button
                onClick={() => setShowCompose(true)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #0891b2, #0e7490)",
                  color: "#0a1e3d",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✍️ Compose Email
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#4a5568",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #1e2535",
                background: currentPage <= 1 ? "#0a0d14" : "#060810",
                color: currentPage <= 1 ? "#2d3748" : "#94a3b8",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
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
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: `1px solid ${page === currentPage ? "rgba(6,182,212,0.3)" : "#1e2535"}`,
                    background:
                      page === currentPage
                        ? "rgba(6,182,212,0.1)"
                        : "#060810",
                    color: page === currentPage ? "#06b6d4" : "#94a3b8",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    minWidth: 32,
                  }}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #1e2535",
                background:
                  currentPage >= totalPages ? "#0a0d14" : "#060810",
                color:
                  currentPage >= totalPages ? "#2d3748" : "#94a3b8",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                cursor:
                  currentPage >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 16,
              padding: 32,
              width: 420,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 12,
              }}
            >
              Delete Outreach Email
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
              Are you sure you want to delete this email?
            </p>
            <div
              style={{
                background: "#060810",
                border: "1px solid #1e2535",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#e2e8f0",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {deleteTarget.subject}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#4a5568",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                To: {deleteTarget.creator.displayName || deleteTarget.creator.handle} · {deleteTarget.status}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid #1e2535",
                  color: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 0.5,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: isDeleting
                    ? "#1e2535"
                    : "rgba(239,68,68,0.15)",
                  border: `1px solid ${isDeleting ? "#1e2535" : "rgba(239,68,68,0.3)"}`,
                  color: isDeleting ? "#4a5568" : "#ef4444",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 0.5,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => resetCompose()}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0a0d14",
              border: "1px solid #1e2535",
              borderRadius: 16,
              padding: 32,
              width: 560,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              New Outreach Email
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Creator Search */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: "#4a5568",
                    letterSpacing: 2,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  TO (CREATOR)
                </label>
                {composeCreatorId ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#060810",
                      border: "1px solid #1e2535",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "#e2e8f0",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {composeCreatorLabel}
                    </span>
                    <button
                      onClick={() => {
                        setComposeCreatorId("");
                        setComposeCreatorLabel("");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#4a5568",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: "0 4px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <input
                    value={creatorSearch}
                    onChange={(e) => setCreatorSearch(e.target.value)}
                    placeholder="Search creators in your database..."
                    style={{
                      width: "100%",
                      background: "#060810",
                      border: "1px solid #1e2535",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#e2e8f0",
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                )}

                {/* Creator search dropdown */}
                {creatorResults.length > 0 && !composeCreatorId && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#0a0d14",
                      border: "1px solid #1e2535",
                      borderRadius: 8,
                      marginTop: 4,
                      maxHeight: 200,
                      overflowY: "auto",
                      zIndex: 10,
                    }}
                  >
                    {creatorResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => selectCreator(c)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderBottom: "1px solid #1e2535",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#060810")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt=""
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: getAvatarColor(
                                c.displayName || c.handle
                              ),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(c.displayName || c.handle)}
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#e2e8f0",
                              fontWeight: 600,
                            }}
                          >
                            {c.displayName || c.handle}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#4a5568",
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {PLATFORM_EMOJI[c.platform.toLowerCase()] || "📱"}{" "}
                            @{c.handle}
                            {c.email ? ` · ${c.email}` : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchingCreators && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#0a0d14",
                      border: "1px solid #1e2535",
                      borderRadius: 8,
                      marginTop: 4,
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "#4a5568",
                      textAlign: "center",
                    }}
                  >
                    Searching creators...
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: "#4a5568",
                    letterSpacing: 2,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  SUBJECT
                </label>
                <input
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Email subject line..."
                  style={{
                    width: "100%",
                    background: "#060810",
                    border: "1px solid #1e2535",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Body */}
              <div>
                <label
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: "#4a5568",
                    letterSpacing: 2,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  BODY
                </label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your outreach message..."
                  rows={8}
                  style={{
                    width: "100%",
                    background: "#060810",
                    border: "1px solid #1e2535",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#e2e8f0",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  onClick={() => resetCompose()}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "transparent",
                    border: "1px solid #1e2535",
                    color: "#94a3b8",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 0.5,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSending}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "1px solid rgba(6,182,212,0.3)",
                    background: "rgba(6,182,212,0.1)",
                    color:
                      isSavingDraft || isSending ? "#4a5568" : "#06b6d4",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 0.5,
                    cursor:
                      isSavingDraft || isSending
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isSavingDraft ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || isSavingDraft}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    background:
                      isSending || isSavingDraft
                        ? "#1e2535"
                        : "linear-gradient(135deg, #0891b2, #0e7490)",
                    color:
                      isSending || isSavingDraft ? "#4a5568" : "#fff",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 0.5,
                    border: "none",
                    cursor:
                      isSending || isSavingDraft
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isSending ? "Sending..." : "Send ✉️"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
