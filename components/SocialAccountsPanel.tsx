"use client";

import { useState, useEffect, useCallback } from "react";

interface SocialAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  accountAvatar: string;
  isActive: boolean;
  connectedAt: string;
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", color: "#E1306C", icon: "📸", permissions: "Publish photos, videos, and stories to your Instagram Business account." },
  { id: "twitter", name: "X / Twitter", color: "#e7e9ea", icon: "𝕏", permissions: "Post tweets and threads on your behalf." },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", icon: "in", permissions: "Share posts and articles to your LinkedIn profile." },
  { id: "tiktok", name: "TikTok", color: "#FF0050", icon: "🎵", permissions: "Upload videos to your TikTok account." },
  { id: "facebook", name: "Facebook", color: "#1877F2", icon: "f", permissions: "Post to your Facebook page or profile." },
  { id: "reddit", name: "Reddit", color: "#FF4500", icon: "🔴", permissions: "Submit posts to subreddits on your behalf." },
];

export default function SocialAccountsPanel() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/social-accounts");
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts);
      } else {
        setError(data.error || "Failed to load accounts");
      }
    } catch {
      setError("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      const res = await fetch(`/api/social-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      alert("Failed to disconnect account. Please try again.");
    } finally {
      setDisconnecting(null);
    }
  };

  const getAccount = (platformId: string) => accounts.find((a) => a.platform === platformId);

  // Loading skeleton
  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="shimmer" style={{ height: 160, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#ef4444", fontFamily: "'DM Mono', monospace" }}>{error}</div>
        <button
          onClick={() => { setError(""); setIsLoading(true); fetchAccounts(); }}
          style={{ marginTop: 12, padding: "8px 16px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, color: "#06b6d4", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {PLATFORMS.map((platform) => {
        const account = getAccount(platform.id);
        const isConnected = !!account;
        const isDisconnecting = disconnecting === account?.id;

        return (
          <div
            key={platform.id}
            style={{
              background: "#0a0d14",
              border: `1px solid ${isConnected ? platform.color + "40" : "#1e2535"}`,
              borderRadius: 14,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transition: "border-color 0.15s",
            }}
          >
            {/* Platform header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: isConnected ? platform.color + "20" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isConnected ? platform.color + "40" : "#1e2535"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: isConnected ? platform.color : "#4a5568",
                }}
              >
                {platform.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{platform.name}</div>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: isConnected ? "#22c55e" : "#4a5568", letterSpacing: 0.5 }}>
                  {isConnected ? "CONNECTED" : "NOT CONNECTED"}
                </div>
              </div>
            </div>

            {/* Connected account info */}
            {isConnected && account && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                {account.accountAvatar ? (
                  <img
                    src={account.accountAvatar}
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #1e2535" }}
                  />
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: platform.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: platform.color }}>
                    {platform.icon}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {account.accountName || account.accountId}
                </div>
              </div>
            )}

            {/* Permissions description */}
            {!isConnected && (
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, flex: 1 }}>
                {platform.permissions}
              </div>
            )}

            {/* Action button */}
            {isConnected ? (
              <button
                onClick={() => handleDisconnect(account!.id)}
                disabled={isDisconnecting}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  cursor: isDisconnecting ? "default" : "pointer",
                  opacity: isDisconnecting ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                {isDisconnecting ? "DISCONNECTING..." : "DISCONNECT"}
              </button>
            ) : (
              <a
                href={`/api/auth/${platform.id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: platform.color + "15",
                  border: `1px solid ${platform.color}40`,
                  color: platform.color,
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                CONNECT {platform.name.toUpperCase()}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
