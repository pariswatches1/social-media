"use client";

import { useState, useRef, useEffect } from "react";

export default function TutorialCard() {
  const [dismissed, setDismissed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user already dismissed the tutorial
    try {
      const d = localStorage.getItem("signal_tutorial_dismissed");
      if (d === "true") setDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("signal_tutorial_dismissed", "true");
    } catch {}
  };

  const handlePlay = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsPlaying(false);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Tutorial card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.06), rgba(14,116,144,0.04))",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 20,
          position: "relative",
        }}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss tutorial"
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            background: "none",
            border: "none",
            color: "#4a5568",
            fontSize: 16,
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 4,
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a5568"; }}
        >
          ✕
        </button>

        {/* Video thumbnail */}
        <button
          onClick={handlePlay}
          style={{
            width: 140,
            height: 80,
            borderRadius: 10,
            overflow: "hidden",
            flexShrink: 0,
            border: "1px solid rgba(6,182,212,0.25)",
            background: "#060810",
            cursor: "pointer",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <img
            src="/tutorial-thumbnail.jpg"
            alt="SIGNAL tutorial"
            width={140}
            height={80}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.7 }}
          />
          {/* Play button overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(6,182,212,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 12px rgba(6,182,212,0.3)",
              }}
            >
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path d="M1 1.5L13 8L1 14.5V1.5Z" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
              How to Use SIGNAL
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'DM Mono', monospace",
                color: "#06b6d4",
                background: "rgba(6,182,212,0.1)",
                padding: "2px 8px",
                borderRadius: 99,
                letterSpacing: 1,
              }}
            >
              TUTORIAL
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Watch a quick walkthrough of your dashboard, core features, and how to get started in under 2 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button
              onClick={handlePlay}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #0891b2, #0e7490)",
                color: "#fff",
                border: "none",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 0.8,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              ▶ Watch now
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                background: "transparent",
                color: "#4a5568",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 0.8,
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              I know my way around
            </button>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {showModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 900,
              background: "#0a0d14",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(6,182,212,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: 12,
                right: 14,
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#94a3b8",
                fontSize: 18,
                cursor: "pointer",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.6)";
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
                How to Use SIGNAL
              </div>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
                Platform tutorial · 78 seconds
              </div>
            </div>

            {/* Video */}
            <div style={{ position: "relative", aspectRatio: "16/9", background: "#060810" }}>
              <video
                ref={videoRef}
                src="/tutorial-main.mp4"
                poster="/tutorial-thumbnail.jpg"
                controls
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </div>

            {/* Footer with short version link */}
            <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#2d3748", fontFamily: "'DM Mono', monospace" }}>
                Prefer a quick overview?
              </span>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.src = "/tutorial-short.mp4";
                    videoRef.current.play();
                  }
                }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: "rgba(6,182,212,0.08)",
                  color: "#06b6d4",
                  border: "1px solid rgba(6,182,212,0.15)",
                  fontSize: 10,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 0.8,
                  cursor: "pointer",
                }}
              >
                25s quick version →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
