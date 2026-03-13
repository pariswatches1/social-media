import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free Instagram Reels Analyzer | SIGNAL",
  description:
    "Analyze Instagram Reels performance. Check engagement rates, play counts, and see which Reels perform best.",
};

export default function ToolPage() {
  return <ToolContent />;
}
