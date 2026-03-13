import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free YouTube Channel Quality Checker | SIGNAL",
  description:
    "Check the quality of any YouTube channel. AI analyzes content, engagement, and growth potential.",
};

export default function Page() {
  return <ToolContent />;
}
