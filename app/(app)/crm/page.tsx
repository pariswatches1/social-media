"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  platform: string;
  followerCount: number;
  engagementRate: number | null;
  niche: string | null;
  email: string | null;
  trustScore: number | null;
  location: string | null;
}

interface ListMember {
  id: string;
  addedAt: string;
  creator: Creator;
}

interface CRMList {
  id: string;
  name: string;
  description: string;
  color: string;
  members: ListMember[];
  _count: { members: number };
}

interface ListForm {
  name: string;
  description: string;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#e1306c",
  TikTok: "#69c9d0",
  YouTube: "#ff0000",
  Twitter: "#1da1f2",
  LinkedIn: "#0077b5",
  Pinterest: "#e60023",
  Facebook: "#1877f2",
  Snapchat: "#fffc00",
};

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "\u{1f4f8}",
  TikTok: "\u{1f3ac}",
  YouTube: "\u25b6\ufe0f",
  Twitter: "\u{1f426}",
  LinkedIn: "\u{1f4bc}",
  Pinterest: "\u{1f4cc}",
  Facebook: "\u{1f310}",
  Snapchat: "\u{1f47b}",
};

const LIST_COLOR_OPTIONS = [
  "#06b6d4", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#3b82f6", "#f97316",
];

const EMPTY_LIST_FORM: ListForm = {
  name: "",
  description: "",
  color: "#06b6d4",
};

const inputStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#4a5568",
  display: "block",
  marginBottom: 6,
  fontFamily: "'DM Mono', monospace",
  letterSpacing: 1.2,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
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

function getAllCreators(lists: CRMList[]): Creator[] {
  const seen = new Set<string>();
  const result: Creator[] = [];
  for (const list of lists) {
    for (const member of list.members) {
      if (!seen.has(member.creator.id)) {
        seen.add(member.creator.id);
        result.push(member.creator);
      }
    }
  }
  return result;
}

function getCreatorsForList(lists: CRMList[], listId: string): Creator[] {
  const list = lists.find((l) => l.id === listId);
  if (!list) return [];
  return list.members.map((m) => m.creator);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrustBar({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return (
      <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748" }}>—</span>
    );
  }
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 60, height: 4, background: "#1e2535", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color, minWidth: 24 }}>{score}</span>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const color = PLATFORM_COLORS[platform] || "#94a3b8";
  const icon = PLATFORM_ICONS[platform] || "\u{1f310}";
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

// ─── List Modal ───────────────────────────────────────────────────────────────

function ListModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: ListForm) => void;
  initialData: ListForm | null;
  isSubmitting: boolean;
  title: string;
}) {
  const [form, setForm] = useState<ListForm>(initialData || EMPTY_LIST_FORM);

  useEffect(() => {
    if (isOpen) setForm(initialData || EMPTY_LIST_FORM);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", marginBottom: 20, margin: "0 0 20px" }}>
          {title}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>LIST NAME *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Hot Prospects"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Color */}
          <div>
            <label style={labelStyle}>COLOR</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LIST_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: c,
                    border: form.color === c ? "2px solid #e2e8f0" : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    transition: "border-color 0.15s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #1e2535",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={isSubmitting || !form.name.trim()}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: !form.name.trim() ? "#1e2535" : "linear-gradient(135deg, #0891b2, #0e7490)",
              color: !form.name.trim() ? "#4a5568" : "#0a1e3d",
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              cursor: form.name.trim() ? "pointer" : "default",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteListModal({
  listName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  listName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>{"\u26a0\ufe0f"}</div>
        <h2 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
          Delete List
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: "#e2e8f0" }}>{listName}</strong>? This will remove all creators from this list. This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #1e2535",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const { user } = useUser();

  // Data
  const [lists, setLists] = useState<CRMList[]>([]);
  const [totalCreators, setTotalCreators] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeList, setActiveList] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "card">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredList, setHoveredList] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<CRMList | null>(null);
  const [deletingList, setDeletingList] = useState<CRMList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchLists = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/crm/lists");
      if (!res.ok) throw new Error(`Failed to load CRM data (${res.status})`);
      const data = await res.json();
      setLists(data.lists || []);
      setTotalCreators(data.totalCreators || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load CRM data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // ── CRUD Handlers ──────────────────────────────────────────────────────────

  async function handleCreateList(form: ListForm) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/crm/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create list");
      }
      setShowCreateModal(false);
      await fetchLists();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditList(form: ListForm) {
    if (!editingList) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/crm/lists/${editingList.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update list");
      }
      setEditingList(null);
      await fetchLists();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update list");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteList() {
    if (!deletingList) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/crm/lists/${deletingList.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete list");
      }
      if (activeList === deletingList.id) setActiveList("all");
      setDeletingList(null);
      await fetchLists();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete list");
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Derived Data ───────────────────────────────────────────────────────────

  const allCreators = getAllCreators(lists);

  const displayedCreators = activeList === "all"
    ? allCreators
    : getCreatorsForList(lists, activeList);

  const filtered = search.trim()
    ? displayedCreators.filter((c) => {
        const q = search.toLowerCase();
        return (
          (c.displayName || "").toLowerCase().includes(q) ||
          (c.handle || "").toLowerCase().includes(q) ||
          (c.platform || "").toLowerCase().includes(q) ||
          (c.niche || "").toLowerCase().includes(q) ||
          (c.location || "").toLowerCase().includes(q)
        );
      })
    : displayedCreators;

  // ── Checkbox helpers ───────────────────────────────────────────────────────

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

  // ── Loading State ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "calc(100vh - 80px)", gap: 0, overflow: "hidden", margin: "-20px -24px" }}>
        {/* Sidebar shimmer */}
        <div style={{ width: 240, flexShrink: 0, background: "#0a0d14", borderRight: "1px solid #1e2535", padding: 20 }}>
          <div className="shimmer" style={{ height: 38, borderRadius: 8, marginBottom: 20 }} />
          <div style={{ borderTop: "1px solid #1e2535", margin: "0 0 16px" }} />
          <div className="shimmer" style={{ height: 14, width: 80, borderRadius: 4, marginBottom: 12 }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 36, borderRadius: 8, marginBottom: 6 }} />
          ))}
        </div>
        {/* Main area shimmer */}
        <div style={{ flex: 1, background: "#060810", padding: 20 }}>
          <div className="shimmer" style={{ height: 44, borderRadius: 8, marginBottom: 16 }} />
          <div className="shimmer" style={{ height: 14, width: 120, borderRadius: 4, marginBottom: 12 }} />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer" style={{ height: 52, borderRadius: 4, marginBottom: 2 }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ textAlign: "center", paddingTop: 120 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>{"\u26a0\ufe0f"}</div>
        <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
          Unable to load CRM
        </h2>
        <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
          {error}
        </p>
        <button
          onClick={() => { setIsLoading(true); fetchLists(); }}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#0a1e3d",
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

  // ── Card View ──────────────────────────────────────────────────────────────

  function CardView() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, padding: "16px 0" }}>
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
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: getAvatarColor(creator.displayName || creator.handle),
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
                  {getInitials(creator.displayName || creator.handle)}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {creator.displayName || creator.handle}
                </div>
                <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
                  {creator.handle.startsWith("@") ? creator.handle : `@${creator.handle}`}
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
                <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{formatFollowers(creator.followerCount)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>ENG. RATE</div>
                <div style={{
                  fontSize: 14,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  color: creator.engagementRate !== null
                    ? creator.engagementRate >= 7 ? "#10b981" : creator.engagementRate >= 4 ? "#f59e0b" : "#94a3b8"
                    : "#2d3748",
                }}>
                  {creator.engagementRate !== null ? `${creator.engagementRate}%` : "\u2014"}
                </div>
              </div>
            </div>

            {/* Trust */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>TRUST SCORE</div>
              <TrustBar score={creator.trustScore} />
            </div>

            {/* Niche + Location */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              {creator.niche && (
                <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", background: "#111827", padding: "2px 6px", borderRadius: 3 }}>
                  {creator.niche}
                </span>
              )}
              {creator.location && (
                <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
                  {"\u{1f4cd}"} {creator.location}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", gap: 0, overflow: "hidden", margin: "-20px -24px" }}>
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
            onClick={() => { setActiveList("all"); setSelectedIds(new Set()); }}
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
              <span style={{ fontSize: 14 }}>{"\u{1f465}"}</span>
              <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: activeList === "all" ? "#06b6d4" : "#e2e8f0" }}>
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
              {totalCreators}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1e2535", margin: "0 0 16px" }} />

        {/* My Lists header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px 10px" }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>
            MY LISTS
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
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
        {lists.length === 0 ? (
          <div style={{ padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#2d3748", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
              No lists yet
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #1e2535",
                background: "transparent",
                color: "#06b6d4",
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
              }}
            >
              + Create List
            </button>
          </div>
        ) : (
          <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            {lists.map((list) => (
              <div key={list.id} style={{ position: "relative" }}>
                <button
                  onClick={() => { setActiveList(list.id); setSelectedIds(new Set()); }}
                  onMouseEnter={() => setHoveredList(list.id)}
                  onMouseLeave={() => setHoveredList(null)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setEditingList(list);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: activeList === list.id ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                    background: activeList === list.id ? "rgba(6,182,212,0.08)" : hoveredList === list.id ? "rgba(255,255,255,0.03)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: list.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: activeList === list.id ? "#e2e8f0" : "#94a3b8", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {list.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: activeList === list.id ? "#06b6d4" : "#4a5568", background: activeList === list.id ? "rgba(6,182,212,0.15)" : "#111827", padding: "1px 7px", borderRadius: 10 }}>
                      {list._count.members}
                    </span>
                    {hoveredList === list.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingList(list); }}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 3,
                          border: "none",
                          background: "rgba(255,255,255,0.05)",
                          color: "#4a5568",
                          fontSize: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                        title="Edit list"
                      >
                        {"\u270f\ufe0f"}
                      </button>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom stats - pipeline health from real data */}
        {allCreators.length > 0 && (
          <div style={{ margin: "16px 12px 0", padding: 12, background: "#060810", border: "1px solid #1e2535", borderRadius: 8 }}>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1.5, marginBottom: 8 }}>
              CRM SUMMARY
            </div>
            {[
              { label: "Total Creators", count: totalCreators, color: "#06b6d4" },
              { label: "Lists", count: lists.length, color: "#8b5cf6" },
              { label: "Avg. Trust", count: allCreators.length > 0 ? Math.round(allCreators.reduce((sum, c) => sum + (c.trustScore || 0), 0) / allCreators.filter((c) => c.trustScore !== null).length) || 0 : 0, color: "#10b981" },
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
        )}
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#060810" }}>
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
          <div style={{ marginRight: 4 }}>
            <h1 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0, lineHeight: 1 }}>
              Creator CRM
            </h1>
          </div>

          <div style={{ width: 1, height: 24, background: "#1e2535" }} />

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#4a5568" }}>
              {"\u{1f50d}"}
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

          <div style={{ flex: 1 }} />

          {/* View toggle */}
          <div style={{ display: "flex", background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 8, overflow: "hidden" }}>
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
              {"\u2630"}
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
              {"\u229e"}
            </button>
          </div>

          {/* Active list actions */}
          {activeList !== "all" && (
            <>
              <button
                onClick={() => {
                  const list = lists.find((l) => l.id === activeList);
                  if (list) setEditingList(list);
                }}
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
                Edit List
              </button>
              <button
                onClick={() => {
                  const list = lists.find((l) => l.id === activeList);
                  if (list) setDeletingList(list);
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  letterSpacing: 0.5,
                }}
              >
                Delete List
              </button>
            </>
          )}

          {/* New List button */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #0891b2, #0e7490)",
              color: "#0a1e3d",
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
            <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#06b6d4", fontWeight: 600 }}>
              {selectedCount} selected
            </span>
            <div style={{ width: 1, height: 16, background: "rgba(6,182,212,0.3)" }} />
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
              {"\u2715"} Clear
            </button>
          </div>
        )}

        {/* ── Table / Card area ───────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: view === "card" ? "0 20px" : 0 }}>
          {/* Result count */}
          <div style={{ padding: "10px 20px 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
              SHOWING {filtered.length} CREATOR{filtered.length !== 1 ? "S" : ""}
            </span>
            {(search || activeList !== "all") && (
              <button
                onClick={() => { setSearch(""); setActiveList("all"); }}
                style={{
                  fontSize: 10,
                  fontFamily: "'DM Mono', monospace",
                  color: "#06b6d4",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  letterSpacing: 0.3,
                }}
              >
                {"\u00b7"} CLEAR FILTERS
              </button>
            )}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && !search && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u{1f465}"}</div>
              <h3 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                {activeList === "all" ? "No creators yet" : "This list is empty"}
              </h3>
              <p style={{ fontSize: 12, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
                {activeList === "all" ? "Add creators to your CRM to manage relationships" : "Add creators to this list from the discover page"}
              </p>
            </div>
          )}

          {/* Card view */}
          {view === "card" && filtered.length > 0 && <CardView />}

          {/* List / Table view */}
          {view === "list" && filtered.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0a0d14", borderBottom: "1px solid #1e2535", position: "sticky", top: 0, zIndex: 2 }}>
                  <th style={{ width: 40, padding: "10px 12px" }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={toggleAll}
                      style={{ cursor: "pointer", accentColor: "#06b6d4", width: 13, height: 13 }}
                    />
                  </th>
                  {[
                    { label: "CREATOR", width: "auto" as const },
                    { label: "PLATFORM", width: 130 },
                    { label: "FOLLOWERS", width: 100 },
                    { label: "ENGAGEMENT", width: 110 },
                    { label: "TRUST SCORE", width: 130 },
                    { label: "NICHE", width: 120 },
                    { label: "LOCATION", width: 120 },
                  ].map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        fontSize: 9,
                        fontFamily: "'DM Mono', monospace",
                        color: "#4a5568",
                        letterSpacing: 1.5,
                        fontWeight: 600,
                        width: width !== "auto" ? width : undefined,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && search && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "48px 20px", color: "#2d3748", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                      No creators match your search
                    </td>
                  </tr>
                )}

                {filtered.map((creator, idx) => {
                  const isSelected = selectedIds.has(creator.id);
                  const isHovered = hoveredRow === creator.id;
                  const rowBg = isSelected
                    ? "rgba(6,182,212,0.05)"
                    : isHovered
                    ? "rgba(255,255,255,0.02)"
                    : idx % 2 === 0
                    ? "#060810"
                    : "#0a0d14";

                  return (
                    <tr
                      key={creator.id}
                      onMouseEnter={() => setHoveredRow(creator.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ background: rowBg, borderBottom: "1px solid #1e2535", transition: "background 0.1s" }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "10px 12px", width: 40 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(creator.id)}
                          style={{ cursor: "pointer", accentColor: "#06b6d4", width: 13, height: 13 }}
                        />
                      </td>

                      {/* Creator */}
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {creator.avatarUrl ? (
                            <img
                              src={creator.avatarUrl}
                              alt={creator.displayName}
                              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: getAvatarColor(creator.displayName || creator.handle),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(creator.displayName || creator.handle)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap" }}>
                              {creator.displayName || creator.handle}
                            </div>
                            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
                              {creator.handle.startsWith("@") ? creator.handle : `@${creator.handle}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td style={{ padding: "10px 12px" }}>
                        <PlatformBadge platform={creator.platform} />
                      </td>

                      {/* Followers */}
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
                          {formatFollowers(creator.followerCount)}
                        </span>
                      </td>

                      {/* Engagement */}
                      <td style={{ padding: "10px 12px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: "'DM Mono', monospace",
                            color: creator.engagementRate !== null
                              ? (creator.engagementRate || 0) >= 7 ? "#10b981" : (creator.engagementRate || 0) >= 4 ? "#f59e0b" : "#94a3b8"
                              : "#2d3748",
                          }}
                        >
                          {creator.engagementRate !== null ? `${creator.engagementRate}%` : "\u2014"}
                        </span>
                      </td>

                      {/* Trust Score */}
                      <td style={{ padding: "10px 12px" }}>
                        <TrustBar score={creator.trustScore} />
                      </td>

                      {/* Niche */}
                      <td style={{ padding: "10px 12px" }}>
                        {creator.niche ? (
                          <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", background: "#111827", border: "1px solid #1e2535", padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap" }}>
                            {creator.niche}
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, color: "#2d3748" }}>{"\u2014"}</span>
                        )}
                      </td>

                      {/* Location */}
                      <td style={{ padding: "10px 12px" }}>
                        {creator.location ? (
                          <span style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#4a5568", whiteSpace: "nowrap" }}>
                            {creator.location}
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, color: "#2d3748" }}>{"\u2014"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #1e2535",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#060810",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748" }}>
            {filtered.length} of {totalCreators} creator{totalCreators !== 1 ? "s" : ""}
          </span>
          {activeList !== "all" && (
            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
              {lists.find((l) => l.id === activeList)?.name || ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Create List Modal */}
      <ListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateList}
        initialData={null}
        isSubmitting={isSubmitting}
        title="Create New List"
      />

      {/* Edit List Modal */}
      <ListModal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        onSubmit={handleEditList}
        initialData={editingList ? { name: editingList.name, description: editingList.description, color: editingList.color } : null}
        isSubmitting={isSubmitting}
        title="Edit List"
      />

      {/* Delete List Modal */}
      {deletingList && (
        <DeleteListModal
          listName={deletingList.name}
          onConfirm={handleDeleteList}
          onCancel={() => setDeletingList(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
