"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
type CampaignGoal = "awareness" | "engagement" | "conversions" | "brand";

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: string;
  budget: number;
  startDate: string | null;
  endDate: string | null;
  status: CampaignStatus;
  platforms: string;
  brief: string;
  creators: { creator: { id: string; handle: string; displayName: string; avatarUrl: string | null; platform: string; followerCount: number } }[];
  deliverables: { id: string; type: string; platform: string; status: string }[];
  _count: { creators: number; deliverables: number };
}

interface CampaignForm {
  name: string;
  description: string;
  goal: string;
  budget: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  brief: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: "#4a5568",
  ACTIVE: "#10b981",
  PAUSED: "#f59e0b",
  COMPLETED: "#06b6d4",
  ARCHIVED: "#94a3b8",
};

const GOAL_LABELS: Record<string, { label: string; color: string }> = {
  awareness: { label: "Awareness", color: "#a78bfa" },
  engagement: { label: "Engagement", color: "#f59e0b" },
  conversions: { label: "Conversions", color: "#22c55e" },
  brand: { label: "Brand", color: "#ec4899" },
};

const PLATFORMS = [
  "Instagram",
  "LinkedIn",
  "X / Twitter",
  "TikTok",
  "Reddit",
  "YouTube",
  "Pinterest",
  "Facebook",
  "Snapchat",
];

type FilterTab = "All" | "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
const FILTER_TABS: FilterTab[] = ["All", "DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

const EMPTY_FORM: CampaignForm = {
  name: "",
  description: "",
  goal: "",
  budget: "",
  startDate: "",
  endDate: "",
  platforms: [],
  brief: "",
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

function parsePlatforms(platforms: string): string[] {
  try {
    const parsed = JSON.parse(platforms);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toInputDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

// ─── Campaign Modal ───────────────────────────────────────────────────────────

function CampaignModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: CampaignForm) => void;
  initialData?: CampaignForm;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<CampaignForm>(initialData || EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData || EMPTY_FORM);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  function togglePlatform(label: string) {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(label)
        ? prev.platforms.filter((p) => p !== label)
        : [...prev.platforms, label],
    }));
  }

  const canSubmit = form.name.trim() && form.goal && form.budget.trim() && !isSubmitting;

  return (
    <div
      onClick={onClose}
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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
              {isEdit ? "Edit Campaign" : "New Campaign"}
            </h2>
            <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
              {isEdit ? "Update your campaign details" : "Set up your influencer campaign"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid #1e2535",
              background: "transparent", color: "#4a5568", fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace",
            }}
          >
            x
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

        {/* Description */}
        <div>
          <label style={labelStyle}>DESCRIPTION</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of the campaign"
            style={inputStyle}
          />
        </div>

        {/* Goal */}
        <div>
          <label style={labelStyle}>CAMPAIGN GOAL *</label>
          <select
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
          >
            <option value="" disabled style={{ background: "#0a0d14" }}>Select a goal...</option>
            <option value="awareness" style={{ background: "#0a0d14" }}>Awareness</option>
            <option value="engagement" style={{ background: "#0a0d14" }}>Engagement</option>
            <option value="conversions" style={{ background: "#0a0d14" }}>Conversions</option>
            <option value="brand" style={{ background: "#0a0d14" }}>Brand</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label style={labelStyle}>BUDGET *</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "#4a5568", fontSize: 13, fontFamily: "'DM Mono', monospace", pointerEvents: "none",
            }}>$</span>
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
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>
          <div>
            <label style={labelStyle}>END DATE</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>
        </div>

        {/* Platforms */}
        <div>
          <label style={labelStyle}>TARGET PLATFORMS</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PLATFORMS.map((label) => {
              const active = form.platforms.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => togglePlatform(label)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                    borderRadius: 20, border: `1px solid ${active ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
                    background: active ? "rgba(6,182,212,0.1)" : "transparent",
                    color: active ? "#06b6d4" : "#64748b", fontSize: 11,
                    fontFamily: "'DM Mono', monospace", cursor: "pointer", letterSpacing: 0.5, transition: "all 0.15s",
                  }}
                >
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
            style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 8, border: "1px solid #1e2535",
              background: "transparent", color: "#94a3b8", fontSize: 12,
              fontFamily: "'DM Mono', monospace", letterSpacing: 1, cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit}
            style={{
              flex: 2, padding: "11px 0", borderRadius: 8, border: "none",
              background: canSubmit ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#1e2535",
              color: canSubmit ? "#fff" : "#4a5568", fontSize: 12,
              fontFamily: "'DM Mono', monospace", letterSpacing: 1,
              cursor: canSubmit ? "pointer" : "not-allowed", fontWeight: 600,
            }}
          >
            {isSubmitting ? "SAVING..." : isEdit ? "SAVE CHANGES" : "CREATE CAMPAIGN"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({
  campaignName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  campaignName: string;
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
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>&#9888;&#65039;</div>
        <h3 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px" }}>
          Delete Campaign
        </h3>
        <p style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: "#e2e8f0" }}>{campaignName}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #1e2535",
              background: "transparent", color: "#94a3b8", fontSize: 12,
              fontFamily: "'DM Mono', monospace", letterSpacing: 1, cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
              background: isDeleting ? "#4a5568" : "#ef4444", color: "#fff", fontSize: 12,
              fontFamily: "'DM Mono', monospace", letterSpacing: 1,
              cursor: isDeleting ? "not-allowed" : "pointer", fontWeight: 600,
            }}
          >
            {isDeleting ? "DELETING..." : "DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({
  campaign,
  onEdit,
  onDelete,
}: {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusColor = STATUS_COLORS[campaign.status] || "#4a5568";
  const platforms = parsePlatforms(campaign.platforms);
  const goalInfo = GOAL_LABELS[campaign.goal] || { label: campaign.goal || "—", color: "#94a3b8" };
  const creatorCount = campaign._count?.creators || 0;
  const deliverableCount = campaign._count?.deliverables || 0;
  const doneDeliverables = campaign.deliverables?.filter((d) => d.status === "COMPLETED" || d.status === "PUBLISHED").length || 0;
  const progressPct = deliverableCount > 0 ? (doneDeliverables / deliverableCount) * 100 : 0;

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
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(6,182,212,0.25)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1e2535"; }}
    >
      {/* Row 1: Name + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.2 }}>
          {campaign.name}
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: `${statusColor}18`, border: `1px solid ${statusColor}4d`,
            borderRadius: 20, padding: "3px 9px", flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 6, height: 6, borderRadius: "50%", background: statusColor,
              boxShadow: campaign.status === "ACTIVE" ? `0 0 6px ${statusColor}` : "none",
            }}
          />
          <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, color: statusColor, fontWeight: 600 }}>
            {campaign.status}
          </span>
        </div>
      </div>

      {/* Row 2: Description */}
      {campaign.description && (
        <div style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", lineHeight: 1.4 }}>
          {campaign.description.length > 100 ? campaign.description.slice(0, 100) + "..." : campaign.description}
        </div>
      )}

      {/* Row 3: Date + Goal + Budget */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568" }}>
          {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
        </span>
        <span
          style={{
            fontSize: 10, fontFamily: "'DM Mono', monospace", color: goalInfo.color,
            background: `${goalInfo.color}18`, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5,
          }}
        >
          {goalInfo.label}
        </span>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8", marginLeft: "auto" }}>
          ${campaign.budget.toLocaleString()}
        </span>
      </div>

      {/* Row 4: Platforms */}
      {platforms.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1, marginRight: 2 }}>
            PLATFORMS
          </span>
          {platforms.map((p, i) => (
            <span
              key={i}
              style={{
                fontSize: 10, background: "#060810", border: "1px solid #1e2535",
                borderRadius: 6, padding: "2px 8px", color: "#94a3b8",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Row 5: Deliverables progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1 }}>
            DELIVERABLES
          </span>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>
            {deliverableCount > 0 ? `${doneDeliverables}/${deliverableCount}` : "None yet"}
          </span>
        </div>
        <div style={{ height: 4, background: "#060810", borderRadius: 4, overflow: "hidden", border: "1px solid #1e2535" }}>
          <div
            style={{
              height: "100%", width: `${progressPct}%`,
              background: progressPct === 100
                ? "linear-gradient(90deg, #06b6d4, #0e7490)"
                : "linear-gradient(90deg, #0891b2, #06b6d4)",
              borderRadius: 4, transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Row 6: Creators */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 1 }}>
          CREATORS
        </span>
        {creatorCount === 0 ? (
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2d3748" }}>None assigned</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            {campaign.creators.slice(0, 5).map((c, i) => (
              <div
                key={c.creator.id}
                title={c.creator.displayName || c.creator.handle}
                style={{
                  width: 24, height: 24, borderRadius: "50%", border: "2px solid #0a0d14",
                  marginLeft: i === 0 ? 0 : -8, overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#fff", fontFamily: "'DM Mono', monospace", fontWeight: 700,
                  background: c.creator.avatarUrl ? `url(${c.creator.avatarUrl}) center/cover` : "#1e2535",
                  zIndex: 5 - i, position: "relative",
                }}
              >
                {!c.creator.avatarUrl && (c.creator.displayName?.[0] || c.creator.handle?.[0] || "?")}
              </div>
            ))}
            {creatorCount > 5 && (
              <div
                style={{
                  width: 24, height: 24, borderRadius: "50%", background: "#1e2535",
                  border: "2px solid #0a0d14", marginLeft: -8, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 8,
                  color: "#64748b", fontFamily: "'DM Mono', monospace", fontWeight: 700, position: "relative",
                }}
              >
                +{creatorCount - 5}
              </div>
            )}
            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginLeft: 8 }}>
              {creatorCount} creator{creatorCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Row 7: Action Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #1e2535",
            background: "transparent", color: "#94a3b8", fontSize: 11,
            fontFamily: "'DM Mono', monospace", letterSpacing: 1.2, cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#06b6d4"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e2535"; (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
        >
          EDIT
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: "9px 16px", borderRadius: 8, border: "1px solid #1e2535",
            background: "transparent", color: "#94a3b8", fontSize: 11,
            fontFamily: "'DM Mono', monospace", letterSpacing: 1.2, cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e2535"; (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
        >
          DELETE
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const { user } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error(`Failed to load campaigns (${res.status})`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load campaigns";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleCreate(form: CampaignForm) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          goal: form.goal,
          budget: parseFloat(form.budget) || 0,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          platforms: form.platforms,
          brief: form.brief.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create campaign");
      }
      setShowCreateModal(false);
      await fetchCampaigns();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create campaign";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(form: CampaignForm) {
    if (!editingCampaign) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          goal: form.goal,
          budget: parseFloat(form.budget) || 0,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          platforms: form.platforms,
          brief: form.brief.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update campaign");
      }
      setEditingCampaign(null);
      await fetchCampaigns();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update campaign";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingCampaign) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/${deletingCampaign.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete campaign");
      }
      setDeletingCampaign(null);
      await fetchCampaigns();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete campaign";
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  }

  // ─── Computed ───────────────────────────────────────────────────────────────

  const filtered = activeTab === "All" ? campaigns : campaigns.filter((c) => c.status === activeTab);

  const tabCounts: Record<FilterTab, number> = {
    All: campaigns.length,
    DRAFT: campaigns.filter((c) => c.status === "DRAFT").length,
    ACTIVE: campaigns.filter((c) => c.status === "ACTIVE").length,
    PAUSED: campaigns.filter((c) => c.status === "PAUSED").length,
    COMPLETED: campaigns.filter((c) => c.status === "COMPLETED").length,
    ARCHIVED: campaigns.filter((c) => c.status === "ARCHIVED").length,
  };

  const stats = [
    { label: "TOTAL", value: campaigns.length, color: "#e2e8f0" },
    { label: "ACTIVE", value: tabCounts.ACTIVE, color: "#10b981" },
    { label: "COMPLETED", value: tabCounts.COMPLETED, color: "#06b6d4" },
    { label: "DRAFT", value: tabCounts.DRAFT, color: "#4a5568" },
  ];

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div className="shimmer" style={{ width: 240, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 160, height: 16, borderRadius: 6 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
        <div className="shimmer" style={{ width: 400, height: 40, borderRadius: 10, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: 300, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#9888;&#65039;</div>
        <h2 style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
          Unable to load campaigns
        </h2>
        <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>{error}</p>
        <button
          onClick={() => { setIsLoading(true); fetchCampaigns(); }}
          style={{
            padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#fff", border: "none", fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const editFormData: CampaignForm | undefined = editingCampaign
    ? {
        name: editingCampaign.name,
        description: editingCampaign.description || "",
        goal: editingCampaign.goal || "",
        budget: editingCampaign.budget?.toString() || "",
        startDate: toInputDate(editingCampaign.startDate),
        endDate: toInputDate(editingCampaign.endDate),
        platforms: parsePlatforms(editingCampaign.platforms),
        brief: editingCampaign.brief || "",
      }
    : undefined;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24, flexWrap: "wrap", gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
            Campaigns
          </h1>
          <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
            {user?.firstName ? ` \u00b7 ${user.firstName}` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff",
            fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: 1,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontWeight: 600, boxShadow: "0 4px 14px rgba(8,145,178,0.3)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(8,145,178,0.45)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(8,145,178,0.3)"; }}
        >
          + NEW CAMPAIGN
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 18,
            }}
          >
            <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div
        style={{
          display: "flex", gap: 2, marginBottom: 24, background: "#0a0d14",
          border: "1px solid #1e2535", borderRadius: 10, padding: 4, width: "fit-content",
        }}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const displayLabel = tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 14px", borderRadius: 7, border: "none",
                background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                color: isActive ? "#06b6d4" : "#4a5568", fontSize: 11,
                fontFamily: "'DM Mono', monospace", letterSpacing: 0.8, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                position: "relative", fontWeight: isActive ? 600 : 400,
              }}
            >
              {displayLabel}
              <span
                style={{
                  fontSize: 9, background: isActive ? "rgba(6,182,212,0.2)" : "#1e2535",
                  color: isActive ? "#06b6d4" : "#4a5568", padding: "1px 5px", borderRadius: 10,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {tabCounts[tab]}
              </span>
              {isActive && (
                <div
                  style={{
                    position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)",
                    width: "60%", height: 2, background: "#06b6d4", borderRadius: 2,
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
            background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12,
            padding: 60, textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {campaigns.length === 0 ? "\uD83D\uDCE2" : "\uD83D\uDCCB"}
          </div>
          <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#4a5568", marginBottom: 6 }}>
            {campaigns.length === 0
              ? "No campaigns yet"
              : `No ${activeTab.toLowerCase()} campaigns`}
          </div>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#2d3748", letterSpacing: 0.5, marginBottom: campaigns.length === 0 ? 20 : 0 }}>
            {campaigns.length === 0
              ? "Create your first campaign to start managing influencer collaborations."
              : `No campaigns with ${activeTab.toLowerCase()} status.`}
          </div>
          {campaigns.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "10px 20px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff",
                fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: 1,
                cursor: "pointer", fontWeight: 600,
              }}
            >
              + CREATE CAMPAIGN
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => setEditingCampaign(campaign)}
              onDelete={() => setDeletingCampaign(campaign)}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      <CampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* ── Edit Modal ── */}
      <CampaignModal
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSubmit={handleEdit}
        initialData={editFormData}
        isSubmitting={isSubmitting}
      />

      {/* ── Delete Confirmation ── */}
      {deletingCampaign && (
        <DeleteModal
          campaignName={deletingCampaign.name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCampaign(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
