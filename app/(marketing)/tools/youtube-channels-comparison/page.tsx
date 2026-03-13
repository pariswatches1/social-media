import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "YouTube Channels Comparison Tool | SIGNAL",
  description:
    "Compare two YouTube channels side by side. See who wins on subscribers, engagement, and content.",
};

export default function Page() {
  return <ToolContent />;
}
