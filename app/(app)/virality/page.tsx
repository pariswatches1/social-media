"use client";

import { useState } from "react";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "LinkedIn"];

const PLATFORM_EMOJI: Record<string, string> = {
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "▶️",
  X: "𝕏",
  LinkedIn: "💼",
};

const MOCK_HISTORY = [
  {
    date: "Mar 13, 2026",
    preview: "Stop scrolling — this one hack changed how I...",
    platform: "TikTok",
    score: 91,
  },
  {
    date: "Mar 12, 2026",
    preview: "3 things nobody tells you about building an audience...",
    platform: "Instagram",
    score: 78,
  },
  {
    date: "Mar 11, 2026",
    preview: "I tested 10 hooks over 30 days. Here's what worked.",
    platform: "YouTube",
    score: 84,
  },
  {
    date: "Mar 10, 2026",
    preview: "Hot take: consistency matters less than you think.",
    platform: "X",
    score: 55,
  },
  {
    date: "Mar 9, 2026",
    preview: "The LinkedIn algorithm rewards early engagement. Here's how...",
    platform: "LinkedIn",
    score: 42,
  },
];

const BREAKDOWN = [
  { label: "Hook Strength", score: 85, color: "#06b6d4" },
  { label: "Format Fit", score: 72, color: "#8b5cf6" },
  { label: "Trend Alignment", score: 91, color: "#10b981" },
  { label: "Optimal Timing", score: 65, color: "#f59e0b" },
  { label: "Engagement Potential", score: 78, color: "#06b6d4" },
];

const SUGGESTIONS = [
  { icon: "💬", tip: "Add a question in the first line to boost engagement by ~23%" },
  { icon: "🎠", tip: "This format performs 2.4x better as a carousel on Instagram" },
  { icon: "⏰", tip: "Posting between 6–8pm EST would increase reach by ~18%" },
  { icon: "#️⃣", tip: "Add 3–5 niche hashtags for 40% more targeted reach" },
];

function getScoreColor(score: number) {
  if (score > 80) return "#06b6d4";
  if (score >= 60) return "#10b981";
  if (score >= 30) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number) {
  if (score > 80) return "Viral Ready";
  if (score >= 60) return "High Potential";
  if (score >= 30) return "Moderate";
  return "Needs Work";
}

function ScoreCircle({ score }: { score: number }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <svg width="180" height="180" style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="#1e2535"
            strokeWidth="10"
          />
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease, stroke 0.3s" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color,
            lineHeight: 1,
          }}>{score}</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginTop: 2 }}>/100</span>
        </div>
      </div>
      <div style={{
        fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color,
        letterSpacing: 1, textTransform: "uppercase",
      }}>{label}</div>
    </div>
  );
}

export default function ViralityPage() {
  const [tab, setTab] = useState<"text" | "url">("text");
  const [inputValue, setInputValue] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("TikTok");
  const [loading, setLoading] = useState(false);
  const [scored, setScored] = useState(false);
  const [score] = useState(84);

  function handleScore() {
    setLoading(true);
    setScored(false);
    setTimeout(() => {
      setLoading(false);
      setScored(true);
    }, 1500);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <h1 style={{
            fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800,
            color: "#e2e8f0", margin: 0,
          }}>Virality Scorer</h1>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Predict the viral potential of your content before you post.
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24, marginBottom: 24,
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["text", "url"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: tab === t ? "1px solid rgba(6,182,212,0.3)" : "1px solid #1e2535",
                background: tab === t ? "rgba(6,182,212,0.1)" : "transparent",
                color: tab === t ? "#06b6d4" : "#94a3b8",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: tab === t ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t === "text" ? "📝 Score Text" : "🔗 Score URL"}
            </button>
          ))}
        </div>

        {/* Input field */}
        {tab === "text" ? (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste your caption, hook, or post copy here..."
            rows={5}
            style={{
              width: "100%",
              background: "#060810",
              border: "1px solid #1e2535",
              borderRadius: 8,
              padding: "12px 14px",
              color: "#e2e8f0",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
        ) : (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste a social post URL..."
            style={{
              width: "100%",
              background: "#060810",
              border: "1px solid #1e2535",
              borderRadius: 8,
              padding: "12px 14px",
              color: "#e2e8f0",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        )}

        {/* Platform pills */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568",
            letterSpacing: 2, alignSelf: "center", marginRight: 4,
          }}>PLATFORM</span>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: selectedPlatform === p ? "1px solid rgba(6,182,212,0.4)" : "1px solid #1e2535",
                background: selectedPlatform === p ? "rgba(6,182,212,0.12)" : "#060810",
                color: selectedPlatform === p ? "#06b6d4" : "#94a3b8",
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {PLATFORM_EMOJI[p]} {p}
            </button>
          ))}
        </div>

        {/* Score button */}
        <button
          onClick={handleScore}
          disabled={loading}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px",
            background: loading ? "#0e7490" : "linear-gradient(135deg, #0891b2, #0e7490)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 15,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: 0.5,
            transition: "opacity 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Score It 🔥"}
        </button>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div style={{
          background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12,
          padding: 40, marginBottom: 24, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid #1e2535",
            borderTop: "3px solid #06b6d4",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ color: "#94a3b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            Running virality analysis...
          </span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results Section */}
      {scored && !loading && (
        <>
          {/* Score + Breakdown row */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>
            {/* Giant Score Circle */}
            <div style={{
              background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ScoreCircle score={score} />
            </div>

            {/* Breakdown Bars */}
            <div style={{
              background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24,
            }}>
              <div style={{
                fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
                color: "#e2e8f0", letterSpacing: 0.5, marginBottom: 20,
              }}>Score Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {BREAKDOWN.map((b) => (
                  <div key={b.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>{b.label}</span>
                      <span style={{
                        fontSize: 12, fontFamily: "'DM Mono', monospace", color: b.color, fontWeight: 600,
                      }}>{b.score}<span style={{ color: "#4a5568" }}>/100</span></span>
                    </div>
                    <div style={{ background: "#1e2535", borderRadius: 6, height: 7, overflow: "hidden" }}>
                      <div style={{
                        width: `${b.score}%`, height: "100%",
                        background: b.color,
                        borderRadius: 6,
                        transition: "width 0.8s ease",
                        boxShadow: `0 0 8px ${b.color}55`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div style={{
            background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12,
            padding: 24, marginBottom: 24,
          }}>
            <div style={{
              fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
              color: "#e2e8f0", letterSpacing: 0.5, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>🤖</span> AI Suggestions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {SUGGESTIONS.map((s, i) => (
                <div key={i} style={{
                  background: "#060810",
                  border: "1px solid #1e2535",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>
                    {s.tip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* History Section */}
      <div style={{
        background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 24,
      }}>
        <div style={{
          fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700,
          color: "#e2e8f0", letterSpacing: 0.5, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>🕐</span> Recent Analyses
        </div>

        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 110px 80px 120px",
          gap: 12,
          padding: "8px 14px",
          borderBottom: "1px solid #1e2535",
          marginBottom: 4,
        }}>
          {["DATE", "PREVIEW", "PLATFORM", "SCORE", "ACTION"].map((h) => (
            <span key={h} style={{
              fontSize: 9, fontFamily: "'DM Mono', monospace",
              letterSpacing: 2, color: "#4a5568", fontWeight: 600,
            }}>{h}</span>
          ))}
        </div>

        {MOCK_HISTORY.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 110px 80px 120px",
              gap: 12,
              padding: "12px 14px",
              background: i % 2 === 0 ? "#060810" : "#0a0d14",
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <span style={{ fontSize: 12, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>{row.date}</span>
            <span style={{
              fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{row.preview}</span>
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
              {PLATFORM_EMOJI[row.platform]} {row.platform}
            </span>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: `${getScoreColor(row.score)}22`,
              border: `1px solid ${getScoreColor(row.score)}44`,
              borderRadius: 6,
              padding: "3px 10px",
            }}>
              <span style={{
                fontSize: 13, fontFamily: "'DM Mono', monospace",
                fontWeight: 700, color: getScoreColor(row.score),
              }}>{row.score}</span>
            </div>
            <button style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #1e2535",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              🔄 Re-analyze
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}