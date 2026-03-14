"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────────────

type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
type CampaignGoal = "Awareness" | "Engagement" | "Conversions";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: number;
  startDate: string;
  endDate: string;
  goal: CampaignGoal;
  platforms: string[];
  creatorCount: number;
  creatorColors: string[];
  deliverablesDone: number;
  deliverablesTotal: number;
  reach: string;
  engRate: string;
  roi: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Fashion Drop",
    status: "ACTIVE",
    budget: 12000,
    startDate: "Jun 1, 2026",
    endDate: "Jun 30, 2026",
    goal: "Awareness",
    platforms: ["📸", "🎵"],
    creatorCount: 8,
    creatorColors: ["#06b6d4", "#8b5cf6", "#f59e0b", "#22c55e", "#ec4899"],
    deliverablesDone: 15,
    deliverablesTotal: 20,
    reach: "2.4M",
    engRate: "4.8%",
    roi: "3.2x",
  },
  {
    id: "2",
    name: "Protein Powder Launch",
    status: "ACTIVE",
    budget: 8500,
    startDate: "May 15, 2026",
    endDate: "Jun 15, 2026",
    goal: "Conversions",
    platforms: ["📸", "▶️"],
    creatorCount: 5,
    creatorColors: ["#f59e0b", "#3b82f6", "#22c55e", "#ec4899", "#a78bfa"],
    deliverablesDone: 6,
    deliverablesTotal: 12,
    reach: "890K",
    engRate: "3.1%",
    roi: "1.8x",
  },
  {
    id: "3",
    name: "Holiday Gift Guide",
    status: "DRAFT",
    budget: 25000,
    startDate: "Dec 1, 2026",
    endDate: "Dec 31, 2026",
    goal: "Awareness",
    platforms: ["📸", "🎵", "▶️", "🐦"],
    creatorCount: 0,
    creatorColors: [],
    deliverablesDone: 0,
    deliverablesTotal: 0,
    reach: "—",
    engRate: "—",
    roi: "—",
  },
  {
    id: "4",
    name: "Q1 Brand Awareness",
    status: "COMPLETED",
    budget: 15000,
    startDate: "Jan 1, 2026",
    endDate: "Mar 31, 2026",
    goal: "Awareness",
    platforms: ["🎵", "📸"],
    creatorCount: 12,
    creatorColors: ["#06b6d4", "#8b5cf6", "#f59e0b", "#22c55e", "#ec4899"],
    deliverablesDone: 30,
    deliverablesTotal: 30,
    reach: "5.7M",
    engRate: "6.2%",
    roi: "4.5x",
  },
  {
    id: "5",
    name: "Tech Review Series",
    status: "PAUSED",
    budget: 6000,
    startDate: "Apr 1, 2026",
    endDate: "Apr 30, 2026",
    goal: "Engagement",
    platforms: ["▶️"],
    creatorCount: 3,
    creatorColors: ["#3b82f6", "#f59e0b", "#22c55e"],
    deliverablesDone: 4,
    deliverablesTotal: 9,
    reach: "312K",
    engRate: "5.4%",
    roi: "—",
  },
  {
    id: "6",
    name: "Spring Beauty Collection",
    status: "DRAFT",
    budget: 10000,
    startDate: "Apr 15, 2026",
    endDate: "May 15, 2026",
    goal: "Conversions",
    platforms: ["📸"],
    creatorCount: 0,
    creatorColors: [],
    deliverablesDone: 0,
    deliverablesTotal: 0,
    reach: "—",
    engRate: "—",
    roi: "—",
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CampaignStatus, { dot: string; label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { dot: "#64748b", label: "DRAFT",     color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" },
  ACTIVE:    { dot: "#22c55e", label: "ACTIVE",    color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   },
  PAUSED:    { dot: "#f59e0b", label: "PAUSED",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)"  },
  COMPLETED: { dot: "#06b6d4", label: "COMPLETED", color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.3)"   },
};

const GOAL_CONFIG: Record<CampaignGoal, { color: string; bg: string }> = {
  Awareness:   { color: "#a78bfa", bg: "rgba(167,139,250,0.1)"  },
  Engagement:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"   },
  Conversions: { color: "#22c55e", bg: "rgba(34,197,94,0.1)"    },
};

// ─── Filter Tabs ────────────────────────────────────────────────────────────────────────────

type FilterTab = "All" | "Draft" | "Active" | "Paused" | "Completed";
const FILTER_TABS: FilterTab[] = ["All", "Draft", "Active", "Paused", "Completed"];

function filterCampaigns(campaigns: Campaign[], tab: FilterTab): Campaign[] {
  if (tab === "All") return campaigns;
  const statusMap: Record<FilterTab, CampaignStatus> = {
    All: "ACTIVE",
    Draft: "DRAFT",
    Active: "ACTIVE",
    Paused: "PAUSED",
    Completed: "COMPLETED",
  };
  return campaigns.filter((c) => c.status === statusMap[tab]);
}

// ─── Shared Styles ────────────────────────────────────────────────────────────────────────────

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

const PLATFORMS = [
  { emoji: "📸", label: "Instagram" },
  { emoji: "🎵", label: "TikTok"    },
  { emoji: "▶️", label: "YouTube"   },
  { emoji: "🐦", label: "Twitter"   },
  { emoji: "🎯", label: "Pinterest" },
];

// ─── Campaign Card ────────────────────────────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusCfg = STATUS_CONFIG[campaign.status];
  const goalCfg = GOAL_CONFIG[campaign.goal];
  const progressPct =
    campaign.deliverablesTotal > 0
      ? (campaign.deliverablesDone / campaign.deliverablesTotal) * 100
      : 0;

  const extraCreators = campaign.creatorCount > 5 ? campaign.creatorCount - 5 : 0;
  const visibleCreators = campaign.creatorColors.slice(0, 5);

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
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(6,182,212,0.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#1e2535";
      }}
    >
      {/* Row 1: Name + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            fontSize: 16,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            color: "#e2e8f0",
            lineHeight: 1.2,
          }}
        >
          {campaign.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: statusCfg.bg,
            border: `1px solid ${statusCfg.border}`,
            borderRadius: 20,
            padding: "3px 9px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusCfg.dot,
              boxShadow: campaign.status === "ACTIVE" ? `0 0 6px ${statusCfg.dot}` : "none",
            }}
          />
          <span
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: 1.5,
              color: statusCfg.color,
              fontWeight: 600,
            }}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Row 2: Date + Goal + Budget */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: "#4a5568",
          }}
        >
          📅 {campaign.startDate} – {campaign.endDate}
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            color: goalCfg.color,
            background: goalCfg.bg,
            padding: "2px 8px",
            borderRadius: 4,
            letterSpacing: 0.5,
          }}
        >
          {campaign.goal}
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: "#94a3b8",
            marginLeft: "auto",
          }}
        >
          💰 ${campaign.budget.toLocaleString()}
        </span>
      </div>

      {/* Row 3: Platforms */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1, marginRight: 2 }}>
          PLATFORMS
        </span>
        {campaign.platforms.map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: 15,
              background: "#060810",
              border: "1px solid #1e2535",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Row 4: Progress bar */}
      {campaign.deliverablesTotal > 0 ? (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1 }}>
              DELIVERABLES
            </span>
            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>
              {campaign.deliverablesDone}/{campaign.deliverablesTotal}
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "#060810",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #1e2535",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? "linear-gradient(90deg, #06b6d4, #0e7490)"
                    : "linear-gradient(90deg, #0891b2, #06b6d4)",
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1 }}>
              DELIVERABLES
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "#060810",
              borderRadius: 4,
              border: "1px solid #1e2535",
            }}
          />
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#2d3748", marginTop: 4 }}>
            No deliverables yet
          </div>
        </div>
      )}

      {/* Row 5: Creators */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1 }}>
          CREATORS
        </span>
        {campaign.creatorCount === 0 ? (
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748" }}>
            None assigned
          </span>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            {visibleCreators.map((color, i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid #0a0d14",
                  marginLeft: i === 0 ? 0 : -8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "#fff",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  zIndex: 5 - i,
                  position: "relative",
                }}
              />
            ))}
            {extraCreators > 0 && (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#1e2535",
                  border: "2px solid #0a0d14",
                  marginLeft: -8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "#64748b",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  position: "relative",
                }}
              >
                +{extraCreators}
              </div>
            )}
            <span
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                color: "#4a5568",
                marginLeft: 8,
              }}
            >
              {campaign.creatorCount} creator{campaign.creatorCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Row 6: Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          background: "#060810",
          borderRadius: 8,
          border: "1px solid #1e2535",
          padding: "10px 12px",
        }}
      >
        {[
          { label: "REACH", value: campaign.reach },
          { label: "ENG. RATE", value: campaign.engRate },
          { label: "ROI", value: campaign.roi },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1, marginBottom: 3 }}>
              {label}
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                color: value === "—" ? "#2d3748" : "#e2e8f0",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Row 7: Manage Button */}
      <button
        style={{
          width: "100%",
          padding: "9px 0",
          borderRadius: 8,
          border: "1px solid #1e2535",
          background: "transparent",
          color: "#94a3b8",
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: 1.2,
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.4)";
          (e.currentTarget as HTMLButtonElement).style.color = "#06b6d4";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e2535";
          (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
        }}
      >
        MANAGE →
      </button>
    </div>
  );
}

// ─── New Campaign Modal ─────────────────────────────────────────────────────────────────────

interface NewCampaignForm {
  name: string;
  goal: string;
  budget: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  brief: string;
}

function NewCampaignModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<NewCampaignForm>({
    name: "",
    goal: "",
    budget: "",
    startDate: "",
    endDate: "",
    platforms: [],
    brief: "",
  });

  if (!isOpen) return null;

  function togglePlatform(label: string) {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(label)
        ? prev.platforms.filter((p) => p !== label)
        : [...prev.platforms, label],
    }));
  }

  function handleCreate() {
    // In production this would call an API
    onClose();
    setForm({ name: "", goal: "", budget: "", startDate: "", endDate: "", platforms: [], brief: "" });
  }

  function handleCancel() {
    onClose();
    setForm({ name: "", goal: "", budget: "", startDate: "", endDate: "", platforms: [], brief: "" });
  }

  const canCreate = form.name.trim() && form.goal && form.budget.trim();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {/* Modal card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 16,
            padding: 28,
            width: "100%",
            maxWidth: 520,
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Modal Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  color: "#e2e8f0",
                  margin: 0,
                }}
              >
                New Campaign
              </h2>
              <p
                style={{
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  color: "#4a5568",
                  margin: "4px 0 0",
                  letterSpacing: 0.5,
                }}
              >
                Set up your influencer campaign
              </p>
            </div>
            <button
              onClick={handleCancel}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #1e2535",
                background: "transparent",
                color: "#4a5568",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              ×
            </button>
          </div>

          {/* Campaign Name */}
          <div>
            <label style={labelStyle}>CAMPAIGN NAME *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Summer Fashion Drop"
              style={inputStyle}
            />
          </div>

          {/* Goal */}
          <div>
            <label style={labelStyle}>CAMPAIGN GOAL *</label>
            <select
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              style={{
                ...inputStyle,
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled style={{ background: "#0a0d14" }}>
                Select a goal…
              </option>
              <option value="Awareness" style={{ background: "#0a0d14" }}>Awareness</option>
              <option value="Engagement" style={{ background: "#0a0d14" }}>Engagement</option>
              <option value="Conversions" style={{ background: "#0a0d14" }}>Conversions</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label style={labelStyle}>BUDGET *</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#4a5568",
                  fontSize: 13,
                  fontFamily: "'DM Mono', monospace",
                  pointerEvents: "none",
                }}
              >
                $
              </span>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="5000"
                style={{ ...inputStyle, paddingLeft: 26 }}
              />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>START DATE</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>END DATE</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label style={labelStyle}>TARGET PLATFORMS</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map(({ emoji, label }) => {
                const active = form.platforms.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => togglePlatform(label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: `1px solid ${active ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
                      background: active ? "rgba(6,182,212,0.1)" : "transparent",
                      color: active ? "#06b6d4" : "#64748b",
                      fontSize: 11,
                      fontFamily: "'DM Mono', monospace",
                      cursor: "pointer",
                      letterSpacing: 0.5,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{emoji}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brief */}
          <div>
            <label style={labelStyle}>CAMPAIGN BRIEF</label>
            <textarea
              value={form.brief}
              onChange={(e) => setForm({ ...form, brief: e.target.value })}
              placeholder="Describe the campaign objectives, tone, key messages, content requirements..."
              style={{
                ...inputStyle,
                minHeight: 100,
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 8,
                border: "1px solid #1e2535",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 1,
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              style={{
                flex: 2,
                padding: "11px 0",
                borderRadius: 8,
                border: "none",
                background: canCreate
                  ? "linear-gradient(135deg, #0891b2, #0e7490)"
                  : "#1e2535",
                color: canCreate ? "#fff" : "#4a5568",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 1,
                cursor: canCreate ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              CREATE CAMPAIGN
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = filterCampaigns(CAMPAIGNS, activeTab);

  const tabCounts: Record<FilterTab, number> = {
    All:       CAMPAIGNS.length,
    Draft:     CAMPAIGNS.filter((c) => c.status === "DRAFT").length,
    Active:    CAMPAIGNS.filter((c) => c.status === "ACTIVE").length,
    Paused:    CAMPAIGNS.filter((c) => c.status === "PAUSED").length,
    Completed: CAMPAIGNS.filter((c) => c.status === "COMPLETED").length,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Your Campaigns
          </h1>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#4a5568",
              margin: "4px 0 0",
              letterSpacing: 0.5,
            }}
          >
            {CAMPAIGNS.length} campaign{CAMPAIGNS.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(8,145,178,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(8,145,178,0.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(8,145,178,0.3)";
          }}
        >
          + NEW CAMPAIGN
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 24,
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                border: "none",
                background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                color: isActive ? "#06b6d4" : "#4a5568",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 0.8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
                position: "relative",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab}
              <span
                style={{
                  fontSize: 9,
                  background: isActive ? "rgba(6,182,212,0.2)" : "#1e2535",
                  color: isActive ? "#06b6d4" : "#4a5568",
                  padding: "1px 5px",
                  borderRadius: 10,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {tabCounts[tab]}
              </span>
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: 2,
                    background: "#06b6d4",
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Campaign Grid ── */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div
            style={{
              fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#4a5568",
              marginBottom: 6,
            }}
          >
            No {activeTab !== "All" ? activeTab.toLowerCase() + " " : ""}campaigns
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: "#2d3748",
              letterSpacing: 0.5,
            }}
          >
            {activeTab === "All"
              ? "Create your first campaign to get started."
              : `No campaigns with ${activeTab.toLowerCase()} status.`}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* ── New Campaign Modal ── */}
      <NewCampaignModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
