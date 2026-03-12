"use client";

import { useState, useEffect, useCallback } from "react";
import PlatformBadge from "@/components/ui/PlatformBadge";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";

interface LogEntry {
  id: string;
  scheduledPostId: string;
  platform: string;
  status: string;
  platformPostId: string | null;
  errorMessage: string | null;
  attemptedAt: string;
  completedAt: string | null;
  scheduledPost: {
    content: string;
    platform: string;
  };
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  SUCCESS: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", color: "#22c55e", label: "SUCCESS" },
  FAILED: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: "#ef4444", label: "FAILED" },
  RETRYING: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", color: "#f59e0b", label: "RETRYING" },
};

export default function PublishLogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/publish/log?page=${page}&limit=15`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.error || "Failed to load publish logs");
      }
    } catch {
      setError("Failed to load publish logs");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (isLoading && logs.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <div className="shimmer" style={{ width: 180, height: 20, borderRadius: 6, marginBottom: 8 }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer" style={{ height: 60, borderRadius: 8, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#ef4444", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>{error}</div>
        <button
          onClick={fetchLogs}
          style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #1e2535", background: "transparent", color: "#94a3b8", fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
        >
          RETRY
        </button>
      </div>
    );
  }

  if (logs.length === 0) {
    return <EmptyState icon="📋" title="No publish logs yet" description="Logs will appear here once you publish content to social platforms." />;
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {logs.map((log) => {
          const st = STATUS_STYLES[log.status] || STATUS_STYLES.FAILED;
          return (
            <div
              key={log.id}
              style={{
                background: "#0a0d14",
                border: "1px solid #1e2535",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              {/* Status indicator */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: st.color,
                  flexShrink: 0,
                }}
              />

              {/* Platform */}
              <div style={{ flexShrink: 0 }}>
                <PlatformBadge platform={log.platform} />
              </div>

              {/* Content preview */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.scheduledPost.content.slice(0, 80)}{log.scheduledPost.content.length > 80 ? "..." : ""}
                </div>
                {log.errorMessage && (
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>
                    {log.errorMessage}
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 14,
                  background: st.bg,
                  border: `1px solid ${st.border}`,
                  color: st.color,
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 0.5,
                  flexShrink: 0,
                }}
              >
                {st.label}
              </div>

              {/* Timestamp */}
              <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", flexShrink: 0, minWidth: 80, textAlign: "right" }}>
                {new Date(log.attemptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" "}
                {new Date(log.attemptedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
