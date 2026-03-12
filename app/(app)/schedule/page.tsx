"use client";

import { useState, useEffect, useCallback } from "react";
import PlatformBadge from "@/components/ui/PlatformBadge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import CopyButton from "@/components/ui/CopyButton";
import { PLATFORMS } from "@/lib/platforms";
import PublishLogPanel from "@/components/PublishLogPanel";

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  hashtags: string;
  imagePrompt: string;
  scheduledFor: string | null;
  status: string;
  brandProfileId: string | null;
  calendarColor: string;
  notes: string;
  tags: string;
  approvedBy: string | null;
  createdAt: string;
  publishedAt: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; color: string; label: string }> = {
  DRAFT: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)", color: "#94a3b8", label: "DRAFT" },
  SCHEDULED: { bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)", color: "#06b6d4", label: "SCHEDULED" },
  PENDING_APPROVAL: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", color: "#f59e0b", label: "PENDING" },
  PUBLISHED: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", color: "#22c55e", label: "PUBLISHED" },
  FAILED: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: "#ef4444", label: "FAILED" },
};

const CALENDAR_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444", "#ec4899", "#3b82f6"];

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDate, setCreateDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState("");

  // Create form state
  const [formContent, setFormContent] = useState("");
  const [formPlatform, setFormPlatform] = useState("instagram");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formStatus, setFormStatus] = useState("DRAFT");
  const [formNotes, setFormNotes] = useState("");
  const [formColor, setFormColor] = useState("#06b6d4");
  const [formHashtags, setFormHashtags] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ month: monthStr });
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/schedule?${params}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
      } else {
        setError(data.error || "Failed to load schedule");
      }
    } catch {
      setError("Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  }, [monthStr, filterStatus]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Check for prefill from Library or Create
  useEffect(() => {
    const stored = sessionStorage.getItem("signal_schedule_prefill");
    if (stored) {
      try {
        const prefill = JSON.parse(stored);
        setFormContent(prefill.content || "");
        setFormPlatform(prefill.platform || "instagram");
        setFormHashtags(prefill.hashtags || "");
        setShowCreateModal(true);
      } catch {
        // ignore
      }
      sessionStorage.removeItem("signal_schedule_prefill");
    }
  }, []);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function openCreate(dateStr?: string) {
    setFormContent("");
    setFormPlatform("instagram");
    setFormDate(dateStr || "");
    setFormTime("09:00");
    setFormStatus("DRAFT");
    setFormNotes("");
    setFormColor("#06b6d4");
    setFormHashtags("");
    setCreateDate(dateStr || "");
    setShowCreateModal(true);
    setSelectedPost(null);
  }

  function openEdit(post: ScheduledPost) {
    setFormContent(post.content);
    setFormPlatform(post.platform);
    if (post.scheduledFor) {
      const d = new Date(post.scheduledFor);
      setFormDate(d.toISOString().slice(0, 10));
      setFormTime(d.toISOString().slice(11, 16));
    } else {
      setFormDate("");
      setFormTime("09:00");
    }
    setFormStatus(post.status);
    setFormNotes(post.notes);
    setFormColor(post.calendarColor);
    try {
      setFormHashtags(JSON.parse(post.hashtags).join(" "));
    } catch {
      setFormHashtags("");
    }
    setSelectedPost(post);
    setShowCreateModal(true);
  }

  async function handleSave() {
    if (!formContent.trim()) return;
    setSaving(true);
    try {
      const scheduledFor = formDate && formTime ? new Date(`${formDate}T${formTime}:00`).toISOString() : null;
      const hashtagArr = formHashtags.trim() ? formHashtags.trim().split(/\s+/).map((h) => (h.startsWith("#") ? h : `#${h}`)) : [];
      const body = {
        content: formContent,
        platform: formPlatform,
        scheduledFor,
        status: formStatus,
        notes: formNotes,
        calendarColor: formColor,
        hashtags: JSON.stringify(hashtagArr),
      };

      const url = selectedPost ? `/api/schedule/${selectedPost.id}` : "/api/schedule";
      const method = selectedPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setSelectedPost(null);
        fetchPosts();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedPost) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/schedule/${selectedPost.id}`, { method: "DELETE" });
      if (res.ok) {
        setShowCreateModal(false);
        setSelectedPost(null);
        fetchPosts();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }

  async function markPublished(post: ScheduledPost) {
    try {
      await fetch(`/api/schedule/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED", publishedAt: new Date().toISOString() }),
      });
      fetchPosts();
      setShowCreateModal(false);
      setSelectedPost(null);
    } catch {
      // ignore
    }
  }

  async function publishNow(post: ScheduledPost) {
    setPublishing(true);
    setPublishError("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledPostId: post.id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
        setShowCreateModal(false);
        setSelectedPost(null);
      } else {
        setPublishError(data.error || "Publish failed");
      }
    } catch {
      setPublishError("Network error — could not publish");
    } finally {
      setPublishing(false);
    }
  }

  // Calendar grid helpers
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  function getPostsForDay(day: number): ScheduledPost[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return posts.filter((p) => {
      if (!p.scheduledFor) return false;
      return p.scheduledFor.slice(0, 10) === dateStr;
    });
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Drafts without date
  const unscheduledDrafts = posts.filter((p) => !p.scheduledFor);

  // Loading
  if (isLoading && posts.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div className="shimmer" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 300, height: 16, borderRadius: 6 }} />
        </div>
        <div className="shimmer" style={{ height: 500, borderRadius: 12 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#ef4444", fontFamily: "'DM Mono', monospace" }}>{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
            Content Calendar
          </h1>
          <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
            {posts.length} post{posts.length !== 1 ? "s" : ""} this month
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          + NEW POST
        </button>
      </div>

      {/* Filters & Month nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "1px solid #1e2535", borderRadius: 6, color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>
            ←
          </button>
          <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", minWidth: 160, textAlign: "center" }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: "none", border: "1px solid #1e2535", borderRadius: 6, color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>
            →
          </button>
        </div>

        {/* Status filters */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setFilterStatus("")}
            style={{
              padding: "5px 10px", borderRadius: 14, border: `1px solid ${!filterStatus ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
              background: !filterStatus ? "rgba(6,182,212,0.1)" : "transparent",
              color: !filterStatus ? "#06b6d4" : "#4a5568", fontSize: 10, fontFamily: "'DM Mono', monospace", cursor: "pointer",
            }}
          >
            ALL
          </button>
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              style={{
                padding: "5px 10px", borderRadius: 14, border: `1px solid ${filterStatus === key ? val.border : "#1e2535"}`,
                background: filterStatus === key ? val.bg : "transparent",
                color: filterStatus === key ? val.color : "#4a5568", fontSize: 10, fontFamily: "'DM Mono', monospace", cursor: "pointer",
              }}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #1e2535" }}>
          {dayNames.map((d) => (
            <div key={d} style={{ padding: "10px 8px", fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", textAlign: "center", letterSpacing: 1 }}>
              {d.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: 100, borderRight: idx % 7 !== 6 ? "1px solid #111827" : "none", borderBottom: "1px solid #111827", background: "#080a10" }} />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayPosts = getPostsForDay(day);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={day}
                onClick={() => openCreate(dateStr)}
                style={{
                  minHeight: 100,
                  borderRight: idx % 7 !== 6 ? "1px solid #111827" : "none",
                  borderBottom: "1px solid #111827",
                  padding: 6,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0d1017")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Day number */}
                <div style={{
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  color: isToday ? "#06b6d4" : "#4a5568",
                  marginBottom: 4,
                  fontWeight: isToday ? 700 : 400,
                  ...(isToday ? { background: "rgba(6,182,212,0.15)", borderRadius: 4, display: "inline-block", padding: "1px 5px" } : {}),
                }}>
                  {day}
                </div>

                {/* Post chips */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {dayPosts.slice(0, 3).map((post) => {
                    const sc = STATUS_COLORS[post.status] || STATUS_COLORS.DRAFT;
                    return (
                      <div
                        key={post.id}
                        onClick={(e) => { e.stopPropagation(); openEdit(post); }}
                        style={{
                          fontSize: 9,
                          fontFamily: "'DM Mono', monospace",
                          padding: "3px 6px",
                          borderRadius: 4,
                          background: sc.bg,
                          borderLeft: `3px solid ${post.calendarColor}`,
                          color: sc.color,
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {post.content.slice(0, 25)}{post.content.length > 25 ? "..." : ""}
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <div style={{ fontSize: 9, color: "#4a5568", fontFamily: "'DM Mono', monospace", paddingLeft: 6 }}>
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled Drafts */}
      {unscheduledDrafts.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 10 }}>
            UNSCHEDULED DRAFTS · {unscheduledDrafts.length}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {unscheduledDrafts.map((post) => (
              <div
                key={post.id}
                onClick={() => openEdit(post)}
                style={{
                  background: "#0a0d14",
                  border: "1px solid #1e2535",
                  borderLeft: `3px solid ${post.calendarColor}`,
                  borderRadius: 8,
                  padding: 14,
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2535")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <PlatformBadge platform={post.platform} />
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#94a3b8", background: "rgba(100,116,139,0.1)", padding: "2px 6px", borderRadius: 4 }}>DRAFT</span>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  {post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Log */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 12 }}>
          PUBLISH LOG
        </div>
        <PublishLogPanel />
      </div>

      {/* Empty state */}
      {posts.length === 0 && !isLoading && (
        <div style={{ marginTop: 40 }}>
          <EmptyState
            icon="📅"
            title="No posts scheduled"
            description="Click any day on the calendar or use the New Post button to start scheduling content."
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setSelectedPost(null); }}
        title={selectedPost ? "Edit Post" : "Schedule Post"}
        width={560}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Platform */}
          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>PLATFORM</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFormPlatform(p.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                    background: formPlatform === p.id ? p.bg : "transparent",
                    border: `1px solid ${formPlatform === p.id ? p.border : "#1e2535"}`,
                    color: formPlatform === p.id ? p.color : "#4a5568",
                    fontSize: 11, fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>CONTENT *</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Write your post content..."
              rows={5}
              style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical" }}
            />
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>DATE</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "'DM Mono', monospace", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>TIME</label>
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "'DM Mono', monospace", outline: "none" }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>STATUS</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFormStatus(key)}
                  style={{
                    padding: "5px 12px", borderRadius: 14, cursor: "pointer",
                    background: formStatus === key ? val.bg : "transparent",
                    border: `1px solid ${formStatus === key ? val.border : "#1e2535"}`,
                    color: formStatus === key ? val.color : "#4a5568",
                    fontSize: 10, fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar color */}
          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>COLOR TAG</label>
            <div style={{ display: "flex", gap: 8 }}>
              {CALENDAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormColor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
                    border: formColor === c ? "2px solid #e2e8f0" : "2px solid transparent",
                    outline: formColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>HASHTAGS</label>
            <input
              value={formHashtags}
              onChange={(e) => setFormHashtags(e.target.value)}
              placeholder="#marketing #growth #content"
              style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "'DM Mono', monospace", outline: "none" }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>NOTES</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={2}
              style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "none" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, borderTop: "1px solid #1e2535", paddingTop: 14 }}>
            <button
              onClick={handleSave}
              disabled={saving || !formContent.trim()}
              style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: saving || !formContent.trim() ? "#0d1017" : "linear-gradient(135deg, #0891b2, #0e7490)",
                color: saving || !formContent.trim() ? "#4a5568" : "#fff",
                fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: saving || !formContent.trim() ? "not-allowed" : "pointer",
                letterSpacing: 0.5,
              }}
            >
              {saving ? "SAVING..." : selectedPost ? "UPDATE POST" : "CREATE POST"}
            </button>

            {selectedPost && (
              <>
                <CopyButton text={formContent} />
                {selectedPost.status !== "PUBLISHED" && (
                  <button
                    onClick={() => publishNow(selectedPost)}
                    disabled={publishing}
                    style={{
                      padding: "10px 16px", borderRadius: 8, border: "none",
                      background: publishing ? "#0d1017" : "linear-gradient(135deg, #0891b2, #06b6d4)",
                      color: publishing ? "#4a5568" : "#fff",
                      fontSize: 11, fontFamily: "'DM Mono', monospace",
                      cursor: publishing ? "wait" : "pointer", letterSpacing: 0.5,
                    }}
                  >
                    {publishing ? "PUBLISHING..." : "PUBLISH NOW"}
                  </button>
                )}
                {selectedPost.status !== "PUBLISHED" && (
                  <button
                    onClick={() => markPublished(selectedPost)}
                    style={{
                      padding: "10px 16px", borderRadius: 8,
                      border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)",
                      color: "#22c55e", fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: "pointer",
                    }}
                  >
                    MARK PUBLISHED
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: "10px 16px", borderRadius: 8,
                    border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)",
                    color: "#ef4444", fontSize: 11, fontFamily: "'DM Mono', monospace",
                    cursor: deleting ? "wait" : "pointer",
                  }}
                >
                  {deleting ? "..." : "DELETE"}
                </button>
              </>
            )}
            {publishError && (
              <div style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 11, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                {publishError}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
