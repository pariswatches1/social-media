"use client";

import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 analyses / month",
      "1 platform per generation",
      "1 content variation",
      "Basic virality scoring",
      "Content library (10 saves)",
    ],
    cta: "Get Started",
    planKey: "FREE",
    highlight: false,
  },
  {
    name: "Creator",
    price: "$29",
    period: "/month",
    features: [
      "25 analyses / month",
      "All 7 platforms",
      "2 A/B variations",
      "Virality scoring",
      "Creator discovery (100 results)",
      "Brand voice profiles",
      "Content calendar",
      "Unlimited library saves",
    ],
    cta: "Start Creating",
    planKey: "CREATOR",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    features: [
      "Unlimited analyses",
      "All 7 platforms",
      "3 A/B/C variations",
      "Advanced virality scoring",
      "Creator discovery (unlimited)",
      "CRM & outreach tools",
      "Campaign management",
      "Image prompt generation",
      "SIGNAL Inbox",
    ],
    cta: "Upgrade to Pro",
    planKey: "PRO",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$399",
    period: "/month",
    features: [
      "Everything in Pro",
      "10 team seats",
      "Unlimited brand profiles",
      "Priority AI processing",
      "Post approval workflows",
      "White-label reports",
      "Bulk outreach automation",
      "Dedicated account manager",
      "API access",
    ],
    cta: "Go Agency",
    planKey: "AGENCY",
    highlight: false,
  },
];

interface Props {
  currentPlan?: string;
  onUpgrade?: (plan: string) => void;
  variant?: "light" | "dark";
}

export default function PricingTable({ currentPlan = "FREE", onUpgrade, variant = "light" }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const isDark = variant === "dark";

  const handleUpgrade = async (planKey: string) => {
    if (planKey === "FREE" || planKey === currentPlan) return;

    setLoading(planKey);
    try {
      if (onUpgrade) {
        onUpgrade(planKey);
      } else {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch {
      // Handle error silently
    }
    setLoading(null);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
      {plans.map((plan) => (
        <div
          key={plan.name}
          style={{
            background: isDark
              ? plan.highlight ? "rgba(6,182,212,0.06)" : "#0a0d14"
              : "rgba(255,255,255,0.18)",
            backdropFilter: isDark ? "none" : "blur(16px)",
            WebkitBackdropFilter: isDark ? "none" : "blur(16px)",
            border: `1px solid ${
              isDark
                ? plan.highlight ? "rgba(6,182,212,0.3)" : "#1e2535"
                : plan.highlight ? "rgba(10,10,46,0.2)" : "rgba(255,255,255,0.25)"
            }`,
            borderRadius: 16,
            padding: 28,
            position: "relative",
            transition: "border-color 0.2s",
          }}
        >
          {plan.highlight && (
            <div
              style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "4px 16px",
                background: isDark ? "#06b6d4" : "#0A0A2E",
                borderRadius: 20,
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                color: "#fff",
                letterSpacing: 1,
              }}
            >
              MOST POPULAR
            </div>
          )}

          <div style={{
            fontSize: 14,
            fontFamily: "'DM Mono', monospace",
            color: isDark ? "#4a5568" : "rgba(10,10,46,0.5)",
            letterSpacing: 2,
            marginBottom: 8,
          }}>
            {plan.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
            <span style={{
              fontSize: 36,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: isDark ? "#e2e8f0" : "#0A0A2E",
            }}>
              {plan.price}
            </span>
            <span style={{
              fontSize: 13,
              color: isDark ? "#4a5568" : "rgba(10,10,46,0.45)",
              fontFamily: "'DM Mono', monospace",
            }}>
              {plan.period}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {plan.features.map((f) => (
              <div key={f} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: isDark ? "#94a3b8" : "rgba(10,10,46,0.7)",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{
                  color: isDark ? "#06b6d4" : "#0A0A2E",
                  fontSize: 14,
                  fontWeight: 700,
                }}>
                  ✓
                </span>
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => handleUpgrade(plan.planKey)}
            disabled={plan.planKey === currentPlan || loading === plan.planKey}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              cursor: plan.planKey === currentPlan ? "default" : "pointer",
              background: plan.planKey === currentPlan
                ? isDark ? "#111827" : "rgba(10,10,46,0.08)"
                : isDark ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#0A0A2E",
              border: plan.planKey === currentPlan
                ? isDark ? "1px solid #1e2535" : "1px solid rgba(10,10,46,0.12)"
                : isDark ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(10,10,46,0.5)",
              color: plan.planKey === currentPlan
                ? isDark ? "#4a5568" : "rgba(10,10,46,0.35)"
                : "#FFFFFF",
              fontSize: 13,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              letterSpacing: 1,
              transition: "all 0.2s",
            }}
          >
            {plan.planKey === currentPlan ? "CURRENT PLAN" : loading === plan.planKey ? "LOADING..." : plan.cta.toUpperCase()}
          </button>
        </div>
      ))}
    </div>
  );
}