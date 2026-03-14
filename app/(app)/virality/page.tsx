"use client";

import { useState, useEffect } from "react";

interface ScoringResult {
  overallScore: number;
  hookScore: number;
  formatScore: number;
  trendScore: number;
  timingScore: number;
  engagementScore: number;
  suggestions: string[];
  analysis?: string;
}

interface HistoryEntry {
  id: string;
  inputContent: string;
  platform: string;
  overallScore: number;
  hookScore: number;
  formatScore: number;
  trendScore: number;
  timingScore: number;
  engagementScore: number;
  suggestions: string;
  createdAt: string;
}

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "X / Twitter",
  "LinkedIn",
  "YouTube",
  "Reddit",
  "Facebook",
  "Pinterest",
  "Snapchat",
];

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? "#06b6d4"
      : score >= 60
        ? "#10b981"
        : score >= 40
          ? "#f59e0b"
          : "#ef4444";
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            color,
            fontWeight: 700,
          }}
        >
          {score}
        </span>
      </div>
      <div
        style={{
          background: "#1e2535",
          borderRadius: 6,
          height: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 6,
            boxShadow: `0 0 8px ${color}44`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function ViralityPage() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch scoring history
  useEffect(() => {
    fetch("/api/virality?limit=5")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load history");
        return r.json();
      })
      .then((d) => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [result]); // Refetch after new score

  async function handleScore() {
    if (!content.trim()) {
      setError("Please enter content to score.");
      return;
    }

    setIsScoring(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/virality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: "text",
          content: content.trim(),
          platform,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Scoring failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Scoring failed. Please try again."
      );
    } finally {
      setIsScoring(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "#06b6d4";
    if (score >= 60) return "#10b981";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return "Viral Potential";
    if (score >= 60) return "Strong";
    if (score >= 40) return "Average";
    return "Needs Work";
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 22 }}>⚡</span>
          <h1
            style={{
              fontSize: 22,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Virality Scorer
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          AI-powered content scoring. Paste your draft and get actionable
          feedback.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Input Panel */}
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 16,
            }}
          >
            Your Content
          </div>

          {/* Platform Select */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 2,
                color: "#4a5568",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #1e2535",
                background: "#060810",
                color: "#e2e8f0",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Content Textarea */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 2,
                color: "#4a5568",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your post, caption, thread, or script here..."
              rows={8}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #1e2535",
                background: "#060810",
                color: "#e2e8f0",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                resize: "vertical",
                outline: "none",
                lineHeight: 1.6,
              }}
            />
            <div
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                color: "#4a5568",
                marginTop: 4,
                textAlign: "right",
              }}
            >
              {content.length} / 5000
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleScore}
            disabled={isScoring || !content.trim()}
            style={{
              width: "100%",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background:
                isScoring || !content.trim()
                  ? "#1e2535"
                  : "linear-gradient(135deg, #06b6d4, #0891b2)",
              color:
                isScoring || !content.trim() ? "#4a5568" : "#fff",
              fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              cursor:
                isScoring || !content.trim()
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isScoring ? "Scoring with AI..." : "Score Content"}
          </button>
        </div>

        {/* Results Panel */}
        <div
          style={{
            background: "#0a0d14",
            border: "1px solid #1e2535",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 16,
            }}
          >
            Score Breakdown
          </div>

          {!result && !isScoring && (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                color: "#4a5568",
                fontSize: 13,
              }}
            >
              Enter content and click "Score Content" to get your AI-powered
              virality analysis.
            </div>
          )}

          {isScoring && (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid #1e2535",
                  borderTopColor: "#06b6d4",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                Analyzing your content with AI...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {result && (
            <>
              {/* Overall Score */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                  padding: "16px 0",
                  border: `1px solid ${getScoreColor(result.overallScore)}33`,
                  borderRadius: 12,
                  background: `${getScoreColor(result.overallScore)}0a`,
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    color: getScoreColor(result.overallScore),
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {result.overallScore}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    color: getScoreColor(result.overallScore),
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {getScoreLabel(result.overallScore)}
                </div>
              </div>

              {/* Score Bars */}
              <ScoreBar label="Hook Strength" score={result.hookScore} />
              <ScoreBar label="Format Fit" score={result.formatScore} />
              <ScoreBar
                label="Trend Alignment"
                score={result.trendScore}
              />
              <ScoreBar
                label="Timing Score"
                score={result.timingScore}
              />
              <ScoreBar
                label="Engagement Potential"
                score={result.engagementScore}
              />

              {/* Analysis */}
              {result.analysis && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 14px",
                    background: "#060810",
                    borderRadius: 8,
                    border: "1px solid #1e2535",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: 2,
                      color: "#4a5568",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    AI Analysis
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {result.analysis}
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: 2,
                      color: "#4a5568",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Suggestions
                  </div>
                  {result.suggestions.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 12px",
                        background: "#060810",
                        borderRadius: 6,
                        marginBottom: 6,
                        fontSize: 12,
                        color: "#e2e8f0",
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ color: "#06b6d4", flexShrink: 0 }}>
                        →
                      </span>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div
        style={{
          background: "#0a0d14",
          border: "1px solid #1e2535",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>📜</span> Scoring History
        </div>

        {loadingHistory && (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div
              className="shimmer"
              style={{ height: 60, borderRadius: 8, marginBottom: 8 }}
            />
            <div
              className="shimmer"
              style={{ height: 60, borderRadius: 8 }}
            />
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div
            style={{
              padding: "20px 0",
              textAlign: "center",
              color: "#4a5568",
              fontSize: 13,
            }}
          >
            No scoring history yet. Score some content to build your history.
          </div>
        )}

        {!loadingHistory &&
          history.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                padding: "12px 14px",
                background: i % 2 === 0 ? "#060810" : "#0a0d14",
                borderRadius: 8,
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "#e2e8f0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 4,
                  }}
                >
                  {entry.inputContent.slice(0, 100)}
                  {entry.inputContent.length > 100 ? "..." : ""}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    color: "#4a5568",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <span>{entry.platform}</span>
                  <span>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${getScoreColor(entry.overallScore)}18`,
                  border: `1px solid ${getScoreColor(entry.overallScore)}33`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    color: getScoreColor(entry.overallScore),
                  }}
                >
                  {entry.overallScore}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
