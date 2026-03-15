import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free Instagram Post Advisor — AI Recommendations | SIGNAL",
  description:
    "Get AI-powered recommendations to improve your Instagram content. Analyze any account and get actionable advice.",
};

export default function ToolPage() {
  return <ToolContent />;
}
