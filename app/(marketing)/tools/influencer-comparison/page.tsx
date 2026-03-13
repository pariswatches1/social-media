import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Instagram Influencer Comparison Tool | SIGNAL",
  description:
    "Compare two Instagram accounts side by side. See who wins on followers, engagement, and content performance.",
};

export default function ToolPage() {
  return <ToolContent />;
}
