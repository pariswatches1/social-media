import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free Fake Follower Checker for Instagram | SIGNAL",
  description:
    "Check any Instagram account for fake followers. AI-powered fraud detection analyzes engagement patterns.",
};

export default function ToolPage() {
  return <ToolContent />;
}
