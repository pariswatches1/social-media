"use client";

import { useState, useRef } from "react";

const TUTORIALS = [
  {
    id: "main",
    title: "How to Use SIGNAL",
    desc: "Complete walkthrough of your dashboard, core features, and how to get started.",
    duration: "78s",
    src: "/tutorial-main.mp4",
    thumbnail: "/tutorial-thumbnail.jpg",
  },
  {
    id: "short",
    title: "SIGNAL Quick Overview",
    desc: "A fast-paced summary of the platform for returning users or quick reference.",
    duration: "25s",
    src: "/tutorial-short.mp4",
    thumbnail: "/tutorial-thumbnail.jpg",
  },
];

export default function HelpPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>
          Help & Tutorials
        </h1>
        <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>
          Learn how to get the most out of SIGNAL
        </p>
      </div>

      {/* Active video player */}
      {activeVideo && (
        <div style={{
          background: "#0a0d14",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 24,
        }}>
          <video
            ref={videoRef}
            src={TUTORIALS.find(t => t.id === activeVideo)?.src}
            poster="/tutorial-thumbnail.jpg"
            controls
            autoPlay
            playsInline
            style={{ width: "100%", aspectRatio: "16/9", display: "block", background: "#060810" }}
          />
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
              {TUTORIALS.find(t => t.id === activeVideo)?.title}
            </span>
            <button
              onClick={() => setActiveVideo(null)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                color: "#4a5568",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tutorial cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {TUTORIALS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveVideo(t.id)}
            style={{
              background: "#0a0d14",
              border: `1px solid ${activeVideo === t.id ? "rgba(6,182,212,0.4)" : "#1e2535"}`,
              borderRadius: 14,
              overflow: "hidden",
              textAlign: "left",
              cursor: "pointer",
              transition: "border-color 0.15s, transform 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.3)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = activeVideo === t.id ? "rgba(6,182,212,0.4)" : "#1e2535";
              (e.currentTarget as HTMLButtonElement).style.transform = "";
            }}
          >
            {/* Thumbnail */}
            <div style={{ position: "relative", aspectRatio: "16/9", background: "#060810" }}>
              <img
                src={t.thumbnail}
                alt={t.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.6 }}
              />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(6,182,212,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
                }}>
                  <svg width="16" height="18" viewBox="0 0 14 16" fill="none">
                    <path d="M1 1.5L13 8L1 14.5V1.5Z" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              <div style={{
                position: "absolute", bottom: 8, right: 8,
                background: "rgba(0,0,0,0.7)", borderRadius: 4,
                padding: "2px 6px", fontSize: 10, fontFamily: "'DM Mono', monospace",
                color: "#e2e8f0",
              }}>
                {t.duration}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.6 }}>
                {t.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Getting started tips */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
          Quick Start Guide
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { step: "1", title: "Set up your brand voice", desc: "Go to Brand and define your tone, style, and keywords.", href: "/brand" },
            { step: "2", title: "Connect your accounts", desc: "Link your social platforms in Accounts to enable publishing.", href: "/settings/accounts" },
            { step: "3", title: "Analyze a competitor", desc: "Use Analyze to study any competitor or topic and find content gaps.", href: "/analyze" },
            { step: "4", title: "Create your first post", desc: "Go to Create, pick a platform, and generate on-brand content.", href: "/create" },
            { step: "5", title: "Schedule and publish", desc: "Save your best content and schedule it in your calendar.", href: "/schedule" },
          ].map((item) => (
            <a
              key={item.step}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 10,
                padding: "14px 16px", textDecoration: "none",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(6,182,212,0.3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e2535"; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#06b6d4",
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: "#4a5568" }}>{item.desc}</div>
              </div>
              <span style={{ color: "#2d3748", fontSize: 14 }}>→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
