import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Find YouTube Influencers by Niche | SIGNAL",
  description:
    "Discover YouTube creators in any niche. AI-powered search to find relevant channels.",
};

export default function Page() {
  return <ToolContent />;
}
