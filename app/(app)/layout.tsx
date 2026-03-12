"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/dashboard", label: "DASHBOARD", icon: "📊" },
  { href: "/analyze", label: "ANALYZE", icon: "🔍" },
  { href: "/create", label: "CREATE", icon: "✍️" },
  { href: "/schedule", label: "SCHEDULE", icon: "📅" },
  { href: "/library", label: "LIBRARY", icon: "📚" },
  { href: "/brand", label: "BRAND", icon: "🎨" },
  { href: "/inbox", label: "INBOX", icon: "📬" },
  { href: "/settings/accounts", label: "ACCOUNTS", icon: "🔗" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060810" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 60 : 200,
          background: "#0a0d14",
          borderRight: "1px solid #1e2535",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: collapsed ? "16px 12px" : "16px 18px", borderBottom: "1px solid #1e2535" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #0891b2, #0e7490)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              ⚡
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#e2e8f0", letterSpacing: 1 }}>SIGNAL</div>
                <div style={{ fontSize: 8, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>CONTENT INTELLIGENCE</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px 12px" : "10px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(6,182,212,0.3)" : "transparent"}`,
                  color: isActive ? "#06b6d4" : "#4a5568",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 1,
                  transition: "all 0.15s",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px", borderTop: "1px solid #1e2535", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
          <UserButton />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#4a5568",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ◀
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#4a5568",
                cursor: "pointer",
                fontSize: 14,
                marginLeft: 6,
              }}
            >
              ▶
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Background grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", padding: "20px 24px" }}>{children}</div>
      </main>
    </div>
  );
}
