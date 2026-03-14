"use client";

import { useState, useMemo } from "react";

/* ── Mock outreach data ── */
const MOCK_OUTREACH = [
  { id: "1", creatorName: "Sophia Chen", handle: "@sophiachen", platform: "instagram", subject: "Collaboration Opportunity — Summer Collection", status: "REPLIED" as const, sentAt: "2026-03-12T10:30:00Z", openedAt: "2026-03-12T14:00:00Z", repliedAt: "2026-03-13T09:15:00Z" },
  { id: "2", creatorName: "Jake Fitness", handle: "@jakefitness", platform: "tiktok", subject: "Partnership Inquiry — Protein Launch", status: "OPENED" as const, sentAt: "2026-03-11T08:00:00Z", openedAt: "2026-03-11T18:30:00Z", repliedAt: null },
  { id: "3", creatorName: "Emma Beauty", handle: "@emmabeauty", platform: "youtube", subject: "Sponsored Video Proposal — Q2 Campaign", status: "SENT" as const, sentAt: "2026-03-13T15:45:00Z", openedAt: null, repliedAt: null },
  { id: "4", creatorName: "Marcus Cole", handle: "@marcuscole", platform: "instagram", subject: "Brand Ambassador Program Invite", status: "REPLIED" as const, sentAt: "2026-03-10T09:00:00Z", openedAt: "2026-03-10T12:00:00Z", repliedAt: "2026-03-11T16:00:00Z" },
  { id: "5", creatorName: "Lily Zhang", handle: "@lilyzhang", platform: "tiktok", subject: "Content Collaboration — Spring Series", status: "BOUNCED" as const, sentAt: "2026-03-09T11:00:00Z", openedAt: null, repliedAt: null },
  { id: "6", creatorName: "Alex Rivera", handle: "@alexrivera", platform: "youtube", subject: "Product Review Opportunity", status: "OPENED" as const, sentAt: "2026-03-12T07:30:00Z", openedAt: "2026-03-13T10:00:00Z", repliedAt: null },
  { id: "7", creatorName: "Noor Patel", handle: "@noorpatel", platform: "instagram", subject: "Gifting Campaign — March Drop", status: "DRAFT" as const, sentAt: null, openedAt: null, repliedAt: null },
  { id: "8", creatorName: "Tyler James", handle: "@tylerjames", platform: "linkedin", subject: "B2B Partnership Discussion", status: "SENT" as const, sentAt: "2026-03-13T16:00:00Z", openedAt: null, repliedAt: null },
];

const TEMPLATES = [
  { id: "1", name: "Initial Outreach", subject: "Collaboration Opportunity with [Brand]", preview: "Hi [Creator], I'm reaching out because..." },
  { id: "2", name: "Follow Up", subject: "Following up — [Brand] x [Creator]", preview: "Hi [Creator], Just wanted to follow up on my previous..." },
  { id: "3", name: "Product Gifting", subject: "[Brand] would love to send you something!", preview: "Hi [Creator], We're huge fans of your content and..." },
  { id: "4", name: "Campaign Invite", subject: "You're invited: [Campaign Name]", preview: "Hi [Creator], We're launching a new campaign and..." },
];

type Status = "DRAFT" | "SENT" | "OPENED" | "REPLIED" | "BOUNCED";

const STATUS_COLORS: Record<Status, string> = {
  DRAFT: "#4a5568",
  SENT: "#3b82f6",
  OPENED: "#f59e0b",
  REPLIED: "#10b981",
  BOUNCED: "#ef4444",
};

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

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎤",
  youtube: "▶️",
  twitter: "𝕏",
  linkedin: "💼",
};

export default function OutreachPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_OUTREACH.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (search && !o.creatorName.toLowerCase().includes(search.toLowerCase()) && !o.subject.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search]);

  const stats = useMemo(() => {
    const total = MOCK_OUTREACH.length;
    const sent = MOCK_OUTREACH.filter((o) => o.status !== "DRAFT").length;
    const opened = MOCK_OUTREACH.filter((o) => o.openedAt).length;
    const replied = MOCK_OUTREACH.filter((o) => o.repliedAt).length;
    return {
      total,
      sent,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
    };
  }, []);

  const filters: { label: string; value: "all" | Status }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "DRAFT" },
    { label: "Sent", value: "SENT" },
    { label: "Opened", value: "OPENED" },
    { label: "Replied", value: "REPLIED" },
    { label: "Bounced", value: "BOUNCED" },
  ];

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "TOTAL EMAILS", value: stats.total, icon: "📨" },
          { label: "SENT", value: stats.sent, icon: "✉️" },
          { label: "OPEN RATE", value: `${stats.openRate}%`, icon: "👁️" },
          { label: "REPLY RATE", value: `${stats.replyRate}%`, icon: "💬" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#06b6d4", marginTop: 4 }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {filters.map((f) => {
            const isActive = filter === f.value;
            const count = f.value === "all" ? MOCK_OUTREACH.length : MOCK_OUTREACH.filter((o) => o.status === f.value).length;
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
                <span style={{ fontSize: 9, color: isActive ? "#06b6d4" : "#2d3748" }}>{count}</span>
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
              color: "#fff",
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

      {/* Templates Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            onClick={() => { setSelectedTemplate(t.id); setShowCompose(true); }}
            style={{
              background: "#0a0d14",
              border: `1px solid ${selectedTemplate === t.id ? "rgba(6,182,212,0.3)" : "#1e2535"}`,
              borderRadius: 10,
              padding: "12px 16px",
              minWidth: 200,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#06b6d4", letterSpacing: 0.5, marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>{t.preview}</div>
          </div>
        ))}
      </div>

      {/* Outreach Table */}
      <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, overflow: "hidden" }}>
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 100px 100px 100px 100px 60px",
            padding: "12px 20px",
            borderBottom: "1px solid #1e2535",
            background: "#060810",
          }}
        >
          {["Creator", "Subject", "Status", "Sent", "Opened", "Replied", ""].map((h) => (
            <div key={h} style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#2d3748", letterSpacing: 2 }}>{h}</div>
          ))}
        </div>

        {/* Table Rows */}
        {filtered.map((o, i) => (
          <div
            key={o.id}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr 100px 100px 100px 100px 60px",
              padding: "14px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid #1e2535" : "none",
              background: i % 2 === 0 ? "#0a0d14" : "#060810",
              alignItems: "center",
              transition: "background 0.1s",
            }}
          >
            {/* Creator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "#1e2535",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#06b6d4", fontWeight: 700, flexShrink: 0,
              }}>
                {o.creatorName[0]}
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{o.creatorName}</div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>{PLATFORM_EMOJI[o.platform]} {o.handle}</div>
              </div>
            </div>

            {/* Subject */}
            <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 16 }}>
              {o.subject}
            </div>

            {/* Status */}
            <div>
              <span style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: 1.5,
                padding: "4px 8px", borderRadius: 6,
                background: `${STATUS_COLORS[o.status]}15`,
                color: STATUS_COLORS[o.status],
                border: `1px solid ${STATUS_COLORS[o.status]}30`,
              }}>
                {o.status}
              </span>
            </div>

            {/* Sent */}
            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{formatDate(o.sentAt)}</div>

            {/* Opened */}
            <div style={{ fontSize: 11, color: o.openedAt ? "#f59e0b" : "#2d3748", fontFamily: "'DM Mono', monospace" }}>
              {o.openedAt ? formatDate(o.openedAt) : "—"}
            </div>

            {/* Replied */}
            <div style={{ fontSize: 11, color: o.repliedAt ? "#10b981" : "#2d3748", fontFamily: "'DM Mono', monospace" }}>
              {o.repliedAt ? formatDate(o.repliedAt) : "—"}
            </div>

            {/* Actions */}
            <div>
              <button style={{
                background: "transparent", border: "1px solid #1e2535", borderRadius: 6,
                color: "#4a5568", fontSize: 12, padding: "4px 8px", cursor: "pointer",
              }}>
                ···
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#4a5568", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            No outreach emails match your filters
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setShowCompose(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 16,
              padding: 32, width: 560, maxHeight: "80vh", overflowY: "auto",
            }}
          >
            <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>
              New Outreach Email
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, display: "block", marginBottom: 6 }}>TO (CREATOR)</label>
                <input placeholder="Search creators in your CRM..." style={{
                  width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8,
                  padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
                }} />
              </div>

              <div>
                <label style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, display: "block", marginBottom: 6 }}>TEMPLATE</label>
                <select style={{
                  width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8,
                  padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
                }}>
                  <option value="">Select a template...</option>
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, display: "block", marginBottom: 6 }}>SUBJECT</label>
                <input placeholder="Email subject line..." style={{
                  width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8,
                  padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
                }} />
              </div>

              <div>
                <label style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, display: "block", marginBottom: 6 }}>BODY</label>
                <textarea
                  placeholder="Write your outreach message..."
                  rows={8}
                  style={{
                    width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8,
                    padding: "10px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    outline: "none", resize: "vertical", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  onClick={() => setShowCompose(false)}
                  style={{
                    padding: "9px 20px", borderRadius: 8, background: "transparent",
                    border: "1px solid #1e2535", color: "#94a3b8", fontSize: 11,
                    fontFamily: "'DM Mono', monospace", letterSpacing: 0.5, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button style={{
                  padding: "9px 20px", borderRadius: 8,
                  background: "linear-gradient(135deg, #0891b2, #0e7490)",
                  color: "#fff", fontSize: 11, fontFamily: "'DM Mono', monospace",
                  letterSpacing: 0.5, border: "none", cursor: "pointer",
                }}>
                  Save Draft
                </button>
                <button style={{
                  padding: "9px 20px", borderRadius: 8,
                  background: "linear-gradient(135deg, #0891b2, #0e7490)",
                  color: "#fff", fontSize: 11, fontFamily: "'DM Mono', monospace",
                  letterSpacing: 0.5, border: "none", cursor: "pointer",
                }}>
                  Send ✉️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}