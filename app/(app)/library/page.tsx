"use client";

import { useState, useEffect, useCallback } from "react";
import PlatformBadge from "@/components/ui/PlatformBadge";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import CopyButton from "@/components/ui/CopyButton";
import { PLATFORMS } from "@/lib/platforms";

interface SavedContent {
  id: string;
  topic: string;
  platform: string;
  copy: string;
  hook: string;
  cta: string;
  hashtags: string;
  viralityScore: number;
  tone: string;
  postType: string;
  imagePrompt: string;
  tags: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [items, setItems] = useState<SavedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedItem, setSelectedItem] = useState<SavedContent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterPlatform) params.set("platform", filterPlatform);
      if (search) params.set("search", search);

      const res = await fetch(`/api/library?${params}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        setError(data.error || "Failed to load library");
      }
    } catch {
      setError("Failed to load library");
    } finally {
      setIsLoading(false);
    }
  }, [page, filterPlatform, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedItem(null);
        fetchItems();
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  function parseJSON(str: string): string[] {
    try { return JSON.parse(str); } catch { return []; }
  }

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div className="shimmer" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 300, height: 16, borderRadius: 6 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer" style={{ height: 180, borderRadius: 12 }} />
          ))}
        </div>
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
            Content Library
          </h1>
          <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
            {total} item{total !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search content..."
            style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 14px", color: "#e2e8f0", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 220 }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #1e2535", background: "#0a0d14", color: "#94a3b8", fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
          >
            SEARCH
          </button>
        </div>

        {/* Platform filter */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => { setFilterPlatform(""); setPage(1); }}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: `1px solid ${!filterPlatform ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
              background: !filterPlatform ? "rgba(6,182,212,0.1)" : "transparent",
              color: !filterPlatform ? "#06b6d4" : "#4a5568",
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            ALL
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setFilterPlatform(p.id); setPage(1); }}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${filterPlatform === p.id ? p.border : "#1e2535"}`,
                background: filterPlatform === p.id ? p.bg : "transparent",
                color: filterPlatform === p.id ? p.color : "#4a5568",
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {p.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && !isLoading && (
        <EmptyState
          icon="📚"
          title="Library is empty"
          description="Save content from the Create panel to build your library. All your generated content will appear here."
        />
      )}

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {items.map((item) => {
          const hashtags = parseJSON(item.hashtags);
          return (
            <div
              key={item.id}
              className="fade-in"
              onClick={() => setSelectedItem(item)}
              style={{
                background: "#0a0d14",
                border: "1px solid #1e2535",
                borderRadius: 12,
                padding: 18,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2d3748")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2535")}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <PlatformBadge platform={item.platform} />
                {item.viralityScore > 0 && (
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: item.viralityScore >= 70 ? "#22c55e" : item.viralityScore >= 40 ? "#f59e0b" : "#ef4444" }}>
                    {item.viralityScore}/100
                  </span>
                )}
              </div>

              {/* Topic */}
              <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#e2e8f0", marginBottom: 8, lineHeight: 1.3 }}>
                {item.topic.length > 60 ? item.topic.slice(0, 60) + "..." : item.topic}
              </div>

              {/* Hook preview */}
              {item.hook && (
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", marginBottom: 10, lineHeight: 1.4 }}>
                  {item.hook.length > 80 ? item.hook.slice(0, 80) + "..." : item.hook}
                </div>
              )}

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {item.tone && (
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", background: "#111827", padding: "2px 6px", borderRadius: 4 }}>
                    {item.tone}
                  </span>
                )}
                {item.postType && (
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", background: "#111827", padding: "2px 6px", borderRadius: 4 }}>
                    {item.postType}
                  </span>
                )}
                {hashtags.length > 0 && (
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#06b6d4", background: "rgba(6,182,212,0.05)", padding: "2px 6px", borderRadius: 4 }}>
                    {hashtags.length} tags
                  </span>
                )}
              </div>

              {/* Date */}
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748", marginTop: 10 }}>
                {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.topic || "Content Detail"}
        width={640}
      >
        {selectedItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Platform + score */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <PlatformBadge platform={selectedItem.platform} size="md" />
              {selectedItem.viralityScore > 0 && (
                <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: selectedItem.viralityScore >= 70 ? "#22c55e" : "#f59e0b" }}>
                  VIRALITY: {selectedItem.viralityScore}/100
                </span>
              )}
            </div>

            {/* Hook */}
            {selectedItem.hook && (
              <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>HOOK</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{selectedItem.hook}</div>
              </div>
            )}

            {/* Copy */}
            <div style={{ background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>FULL COPY</div>
                <CopyButton text={selectedItem.copy} />
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {selectedItem.copy}
              </div>
            </div>

            {/* CTA */}
            {selectedItem.cta && (
              <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>CTA</div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{selectedItem.cta}</div>
              </div>
            )}

            {/* Hashtags */}
            {(() => {
              const ht = parseJSON(selectedItem.hashtags);
              if (ht.length === 0) return null;
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>HASHTAGS</div>
                    <CopyButton text={ht.join(" ")} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ht.map((h: string) => (
                      <span key={h} className="tag-chip" style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", color: "#06b6d4" }}>{h}</span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Image prompt */}
            {selectedItem.imagePrompt && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>IMAGE PROMPT</div>
                  <CopyButton text={selectedItem.imagePrompt} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{selectedItem.imagePrompt}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, borderTop: "1px solid #1e2535", paddingTop: 16 }}>
              <button
                onClick={() => {
                  const hashtags = parseJSON(selectedItem.hashtags);
                  sessionStorage.setItem("signal_schedule_prefill", JSON.stringify({
                    content: selectedItem.copy,
                    platform: selectedItem.platform,
                    hashtags: hashtags.join(" "),
                  }));
                  window.location.href = "/schedule";
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "linear-gradient(135deg, #0891b2, #0e7490)",
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  letterSpacing: 0.5,
                }}
              >
                SCHEDULE THIS
              </button>
              <CopyButton text={[selectedItem.copy, selectedItem.hashtags ? "\n\n" + parseJSON(selectedItem.hashtags).join(" ") : ""].join("")} />
              <button
                onClick={() => handleDelete(selectedItem.id)}
                disabled={deletingId === selectedItem.id}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.05)",
                  color: "#ef4444",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: deletingId === selectedItem.id ? "wait" : "pointer",
                  letterSpacing: 0.5,
                }}
              >
                {deletingId === selectedItem.id ? "DELETING..." : "DELETE"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
