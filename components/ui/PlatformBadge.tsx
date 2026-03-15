"use client";

import { getPlatformById } from "@/lib/platforms";

interface PlatformBadgeProps {
  platform: string;
  size?: "sm" | "md";
}

export default function PlatformBadge({ platform, size = "sm" }: PlatformBadgeProps) {
  const p = getPlatformById(platform);
  const color = p?.color ?? "#4a5568";
  const label = p?.label ?? platform;

  const isSmall = size === "sm";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? 5 : 6,
        padding: isSmall ? "2px 8px" : "4px 12px",
        borderRadius: 20,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        fontSize: isSmall ? 10 : 12,
        fontFamily: "'DM Mono', monospace",
        color,
        letterSpacing: 0.5,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          width: isSmall ? 6 : 8,
          height: isSmall ? 6 : 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}
