import Link from "next/link";
import type { Metadata } from "next";
import ComparisonContent from "./ComparisonContent";

export const metadata: Metadata = {
  title: "SIGNAL vs Sprout Social — AI Social Media Tool for $29/mo",
  description:
    "Compare SIGNAL vs Sprout Social. Get AI content generation, competitor intelligence, virality scoring, and auto-publishing for $29/mo vs Sprout's $299/mo. Start free.",
};

export default function SignalVsSproutPage() {
  return <ComparisonContent />;
}
