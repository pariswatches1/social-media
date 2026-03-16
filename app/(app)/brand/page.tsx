"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";

interface BrandProfile {
  id: string;
  name: string;
  voice: string;
  tone: string;
  audience: string;
  guidelines: string;
  examples: string;
  colors: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const TONE_OPTIONS = [
  "Professional", "Casual", "Witty", "Inspirational", "Educational",
  "Bold", "Empathetic", "Authoritative", "Playful", "Minimalist",
];

const VOICE_OPTIONS = [
  "Direct & no-fluff", "Storytelling", "Data-driven", "Conversational",
  "Thought-leader", "Relatable & personal", "Provocative", "Supportive & warm",
];

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
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 80,
  resize: "vertical" as const,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#4a5568",
  display: "block",
  marginBottom: 6,
  fontFamily: "'DM Mono', monospace",
  letterSpacing: 1,
};

export default function BrandPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrandProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [voice, setVoice] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [examples, setExamples] = useState("");
  const [colors, setColors] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/brand");
      const data = await res.json();
      if (res.ok) {
        setProfiles(data.profiles);
      } else {
        setError(data.error || "Failed to load profiles");
      }
    } catch {
      setError("Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  function resetForm() {
    setName("");
    setVoice("");
    setTone("");
    setAudience("");
    setGuidelines("");
    setExamples("");
    setColors("");
    setIsDefault(false);
    setEditingProfile(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(p: BrandProfile) {
    setEditingProfile(p);
    setName(p.name);
    setVoice(p.voice);
    setTone(p.tone);
    setAudience(p.audience);
    setGuidelines(p.guidelines);
    setExamples(p.examples);
    setColors(p.colors);
    setIsDefault(p.isDefault);
    setShowModal(true);
  }

  async function handleSave() {
    if (!name.trim() || !voice.trim() || !tone.trim()) return;
    setSaving(true);
    try {
      const payload = { name, voice, tone, audience, guidelines, examples, colors, isDefault };
      const url = editingProfile ? `/api/brand/${editingProfile.id}` : "/api/brand";
      const method = editingProfile ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchProfiles();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Operation failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/brand/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProfiles();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Operation failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await fetch(`/api/brand/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      fetchProfiles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Operation failed. Please try again.");
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div className="shimmer" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="shimmer" style={{ width: 300, height: 16, borderRadius: 6 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
            Brand Voice Kit
          </h1>
          <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
            {profiles.length} profile{profiles.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            color: "#0a1e3d",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          + NEW PROFILE
        </button>
      </div>

      {/* Empty state */}
      {profiles.length === 0 && (
        <EmptyState
          icon="🎨"
          title="No brand profiles yet"
          description="Create your first brand voice profile to maintain consistent messaging across all platforms."
          actionLabel="Create Profile"
          onAction={openCreate}
        />
      )}

      {/* Profile cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {profiles.map((p) => (
          <div
            key={p.id}
            className="fade-in"
            style={{
              background: "#0a0d14",
              border: `1px solid ${p.isDefault ? "rgba(6,182,212,0.4)" : "#1e2535"}`,
              borderRadius: 12,
              padding: 20,
              position: "relative",
            }}
          >
            {/* Default badge */}
            {p.isDefault && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                  color: "#06b6d4",
                  background: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.3)",
                  padding: "2px 8px",
                  borderRadius: 20,
                  letterSpacing: 1,
                }}
              >
                DEFAULT
              </div>
            )}

            {/* Name */}
            <div style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
              {p.name}
            </div>

            {/* Tags row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#94a3b8", background: "#111827", padding: "3px 8px", borderRadius: 4 }}>
                {p.voice}
              </span>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#94a3b8", background: "#111827", padding: "3px 8px", borderRadius: 4 }}>
                {p.tone}
              </span>
            </div>

            {/* Audience */}
            {p.audience && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 3, letterSpacing: 1 }}>AUDIENCE</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  {p.audience.length > 80 ? p.audience.slice(0, 80) + "..." : p.audience}
                </div>
              </div>
            )}

            {/* Guidelines preview */}
            {p.guidelines && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#4a5568", marginBottom: 3, letterSpacing: 1 }}>GUIDELINES</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  {p.guidelines.length > 80 ? p.guidelines.slice(0, 80) + "..." : p.guidelines}
                </div>
              </div>
            )}

            {/* Color swatches */}
            {p.colors && (
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {p.colors.split(",").map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: c.trim(),
                      border: "1px solid #1e2535",
                    }}
                    title={c.trim()}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, borderTop: "1px solid #1e2535", paddingTop: 14 }}>
              <button
                onClick={() => openEdit(p)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 6,
                  border: "1px solid #2d3748",
                  background: "transparent",
                  color: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  letterSpacing: 0.5,
                }}
              >
                EDIT
              </button>
              {!p.isDefault && (
                <button
                  onClick={() => handleSetDefault(p.id)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 6,
                    border: "1px solid rgba(6,182,212,0.3)",
                    background: "rgba(6,182,212,0.05)",
                    color: "#06b6d4",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    letterSpacing: 0.5,
                  }}
                >
                  SET DEFAULT
                </button>
              )}
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                style={{
                  padding: "7px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.05)",
                  color: "#ef4444",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: deletingId === p.id ? "wait" : "pointer",
                  letterSpacing: 0.5,
                  opacity: deletingId === p.id ? 0.5 : 1,
                }}
              >
                {deletingId === p.id ? "..." : "DEL"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingProfile ? "Edit Brand Profile" : "New Brand Profile"}
        width={560}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>PROFILE NAME *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My SaaS Brand, Personal Blog..."
              style={inputStyle}
            />
          </div>

          {/* Voice */}
          <div>
            <label style={labelStyle}>BRAND VOICE *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: `1px solid ${voice === v ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
                    background: voice === v ? "rgba(6,182,212,0.1)" : "transparent",
                    color: voice === v ? "#06b6d4" : "#4a5568",
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    letterSpacing: 0.5,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <input
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="Or type custom voice..."
              style={inputStyle}
            />
          </div>

          {/* Tone */}
          <div>
            <label style={labelStyle}>TONE *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: `1px solid ${tone === t ? "rgba(6,182,212,0.5)" : "#1e2535"}`,
                    background: tone === t ? "rgba(6,182,212,0.1)" : "transparent",
                    color: tone === t ? "#06b6d4" : "#4a5568",
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    letterSpacing: 0.5,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="Or type custom tone..."
              style={inputStyle}
            />
          </div>

          {/* Audience */}
          <div>
            <label style={labelStyle}>TARGET AUDIENCE</label>
            <textarea
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Describe your ideal audience... e.g. SaaS founders, 25-45, tech-savvy, growth-focused"
              style={textareaStyle}
            />
          </div>

          {/* Guidelines */}
          <div>
            <label style={labelStyle}>CONTENT GUIDELINES</label>
            <textarea
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              placeholder="Do's and don'ts... e.g. Never use jargon, always include CTA, mention the product name..."
              style={{ ...textareaStyle, minHeight: 70 }}
            />
          </div>

          {/* Examples */}
          <div>
            <label style={labelStyle}>EXAMPLE CONTENT</label>
            <textarea
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Paste 1-2 examples of content that matches your desired voice..."
              style={{ ...textareaStyle, minHeight: 70 }}
            />
          </div>

          {/* Colors */}
          <div>
            <label style={labelStyle}>BRAND COLORS (comma-separated hex)</label>
            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. #06b6d4, #0e7490, #e2e8f0"
              style={inputStyle}
            />
            {colors && (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {colors.split(",").map((c, i) => {
                  const trimmed = c.trim();
                  if (!trimmed.startsWith("#")) return null;
                  return (
                    <div
                      key={i}
                      style={{ width: 24, height: 24, borderRadius: 6, background: trimmed, border: "1px solid #1e2535" }}
                      title={trimmed}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Default toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setIsDefault(!isDefault)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                border: "none",
                background: isDefault ? "#06b6d4" : "#1e2535",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 3,
                  left: isDefault ? 21 : 3,
                  transition: "left 0.2s",
                }}
              />
            </button>
            <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#94a3b8" }}>
              Set as default profile
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !voice.trim() || !tone.trim()}
            style={{
              padding: "12px 0",
              borderRadius: 8,
              border: "none",
              background: saving || !name.trim() || !voice.trim() || !tone.trim()
                ? "#1e2535"
                : "linear-gradient(135deg, #0891b2, #0e7490)",
              color: saving || !name.trim() || !voice.trim() || !tone.trim() ? "#4a5568" : "#0a1e3d",
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: 1,
              cursor: saving ? "wait" : "pointer",
              marginTop: 4,
            }}
          >
            {saving ? "SAVING..." : editingProfile ? "UPDATE PROFILE" : "CREATE PROFILE"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
