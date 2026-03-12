"use client";

import { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";

interface Activity {
  id: string;
  type: string;
  title: string;
  metadata: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  ANALYSIS: { icon: "🔍", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  GENERATION: { icon: "✍️", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  CONTENT_SAVED: { icon: "📚", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  CONTENT_SCHEDULED: { icon: "📅", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  CONTENT_PUBLISHED: { icon: "🚀", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  BRAND_PROFILE_CREATED: { icon: "🎨", color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  BRAND_PROFILE_UPDATED: { icon: "🎨", color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
};

const TYPE_LABELS: Record<string, string> = {
  ANALYSIS: "ANALYSIS",
  GENERATION: "GENERATION",
  CONTENT_SAVED: "SAVED",
  CONTENT_SCHEDULED: "SCHEDULED",
  CONTENT_PUBLISHED: "PUBLISHED",
  BRAND_PROFILE_CREATED: "BRAND",
  BRAND_PROFILE_UPDATED: "BRAND",
};

export default function InboxPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState("");

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterType) params.set("type", filterType);
      const res = await fetch(`/api/inbox?${params}`);
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        setError(data.error || "Failed to load inbox");
      }
    } catch {
      setError("Failed to load inbox");
    } finally {
      setIsLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function groupByDate(items: Activity[]): Record<string, Activity[]> {
    const groups: Record<string, Activity[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    for (const item of items) {
      const d = new Date(item.createdAt).toDateString();
      let label = new Date(item.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      if (d === today) label = "Today";
      else if (d === yesterday) label = "Yesterday";

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    }
    return groups;
  }

  const uniqueTypes = [...new Set(["ANALYSIS", "GENERATION", "CONTENT_SAVED", "CONTENT_SCHEDULED", "CONTENT_PUBLISHED", "BRAND_PROFILE_CREATED"])];
  const grouped = groupByDate(activities);

  // Loading
  if (isLoading && activities.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div className="shimmer" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 300, height: 16, borderRadius: 6 }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10, marginBottom: 8 }} />
        ))}
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
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
          SIGNAL Inbox
        </h1>
        <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
          {total} activit{total !== 1 ? "ies" : "y"} tracked
        </p>
      </div>

      {/* Type filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => { setFilterType(""); setPage(1); }}
          style={{
            padding: "5px 12px", borderRadius: 14,
            border: `1px solid ${!filterType ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
            background: !filterType ? "rgba(6,182,212,0.1)" : "transparent",
            color: !filterType ? "#06b6d4" : "#4a5568",
            fontSize: 10, fontFamily: "'DM Mono', monospace", cursor: "pointer",
          }}
        >
          ALL
        </button>
        {uniqueTypes.map((t) => {
          const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.ANALYSIS;
          return (
            <button
              key={t}
              onClick={() => { setFilterType(t); setPage(1); }}
              style={{
                padding: "5px 12px", borderRadius: 14,
                border: `1px solid ${filterType === t ? cfg.color + "80" : "#1e2535"}`,
                background: filterType === t ? cfg.bg : "transparent",
                color: filterType === t ? cfg.color : "#4a5568",
                fontSize: 10, fontFamily: "'DM Mono', monospace", cursor: "pointer",
              }}
            >
              {cfg.icon} {TYPE_LABELS[t] || t}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {activities.length === 0 && !isLoading && (
        <EmptyState
          icon="📬"
          title="Inbox is empty"
          description="Your activity will appear here as you create, save, and schedule content. Start by analyzing a topic or generating content."
        />
      )}

      {/* Activity feed */}
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 10, paddingLeft: 4 }}>
            {dateLabel.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((activity) => {
              const cfg = TYPE_CONFIG[activity.type] || { icon: "📋", color: "#94a3b8", bg: "rgba(100,116,139,0.1)" };
              let meta: Record<string, unknown> = {};
              try { meta = JSON.parse(activity.metadata); } catch { /* ignore */ }

              return (
                <div
                  key={activity.id}
                  className="fade-in"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background: "#0a0d14",
                    border: "1px solid #1e2535",
                    borderRadius: 10,
                    padding: "12px 16px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2535")}
                >
                  {/* Icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, background: cfg.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                      {activity.title}
                    </div>
                    {meta.platform && (
                      <span style={{
                        fontSize: 9, fontFamily: "'DM Mono', monospace",
                        color: cfg.color, background: cfg.bg,
                        padding: "2px 6px", borderRadius: 4, marginTop: 4, display: "inline-block",
                      }}>
                        {String(meta.platform).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatTime(activity.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
