"use client";

import SocialAccountsPanel from "@/components/SocialAccountsPanel";

export default function ConnectedAccountsPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
          Connected Accounts
        </h1>
        <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#4a5568", margin: "4px 0 0", letterSpacing: 0.5 }}>
          Connect your social media accounts to publish directly from SIGNAL
        </p>
      </div>

      {/* Info banner */}
      <div
        style={{
          background: "rgba(6,182,212,0.06)",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>🔒</span>
        <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
          Your access tokens are encrypted with AES-256 before storage. We never store plaintext credentials. You can disconnect any account at any time.
        </div>
      </div>

      {/* Accounts grid */}
      <SocialAccountsPanel />
    </div>
  );
}
