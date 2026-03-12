"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

/* ── Sprout-inspired grouped sidebar navigation ── */
const NAV_SECTIONS = [
  {
    label: "INTELLIGENCE",
    items: [
      { href: "/dashboard", label: "DASHBOARD", icon: "📊" },
      { href: "/analyze", label: "ANALYZE", icon: "🔍" },
      { href: "/create", label: "CREATE", icon: "✍️" },
    ],
  },
  {
    label: "PUBLISHING",
    items: [
      { href: "/schedule", label: "SCHEDULE", icon: "📅" },
      { href: "/library", label: "LIBRARY", icon: "📚" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/brand", label: "BRAND", icon: "🎨" },
      { href: "/settings/accounts", label: "ACCOUNTS", icon: "🔗" },
    ],
  },
  {
    label: "ACTIVITY",
    items: [{ href: "/inbox", label: "INBOX", icon: "📬" }],
  },
];

const ALL_NAV = NAV_SECTIONS.flatMap((s) => s.items);

/* Page titles for the top toolbar */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analyze": "Competitor Intelligence",
  "/create": "Content Generation",
  "/schedule": "Publishing",
  "/library": "Content Library",
  "/brand": "Brand Voice Kit",
  "/inbox": "SIGNAL Inbox",
  "/settings/accounts": "Connected Accounts",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || "SIGNAL";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060810" }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: collapsed ? 60 : 210,
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
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
          </Link>
        </div>

        {/* Nav — grouped sections (Sprout pattern) */}
        <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: 6 }}>
              {/* Section label */}
              {!collapsed && (
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: "#2d3748",
                    letterSpacing: 2,
                    padding: "8px 14px 4px",
                    userSelect: "none",
                  }}
                >
                  {section.label}
                </div>
              )}

              {/* Section items */}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: collapsed ? "9px 12px" : "9px 14px",
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
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #1e2535",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
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

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── Top Toolbar (Sprout pattern) ── */}
        <header
          style={{
            height: 52,
            background: "#0a0d14",
            borderBottom: "1px solid #1e2535",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
          }}
        >
          {/* Page title / breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              {pageTitle}
            </h2>
          </div>

          {/* Global action buttons (Sprout's right-side toolbar) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Compose / Create button — always accessible */}
            <Link
              href="/create"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #0891b2, #0e7490)",
                color: "#fff",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 0.5,
                textDecoration: "none",
                cursor: "pointer",
                border: "none",
                transition: "opacity 0.15s",
              }}
            >
              <span style={{ fontSize: 14 }}>✍️</span>
              Compose
            </Link>

            {/* Schedule button */}
            <Link
              href="/schedule"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid #1e2535",
                color: "#94a3b8",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 0.5,
                textDecoration: "none",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 13 }}>📅</span>
              Schedule
            </Link>

            {/* Inbox / Notifications */}
            <Link
              href="/inbox"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid #1e2535",
                color: "#94a3b8",
                textDecoration: "none",
                cursor: "pointer",
                fontSize: 15,
                transition: "border-color 0.15s",
              }}
            >
              📬
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, overflow: "auto" }}>
          {/* Background grid */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", padding: "20px 24px" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
