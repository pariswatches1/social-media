import type { Metadata } from "next";
import ToolsIndexContent from "./ToolsIndexContent";

export const metadata: Metadata = {
  title: "Free Social Media Tools for Creators & Marketers | SIGNAL",
  description:
    "20+ free tools to analyze, audit, and grow your Instagram & YouTube. Engagement calculators, hashtag generators, fake follower checkers, AI content ideas, and more.",
};

export default function ToolsPage() {
  return <ToolsIndexContent />;
}
