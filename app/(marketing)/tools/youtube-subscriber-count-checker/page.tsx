import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free YouTube Subscriber Count Checker | SIGNAL",
  description:
    "Check the subscriber count of any YouTube channel. See subscriber tier, growth rate, and milestones.",
};

export default function Page() {
  return <ToolContent />;
}
