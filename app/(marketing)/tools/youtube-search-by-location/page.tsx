import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Find YouTube Influencers by Location | SIGNAL",
  description:
    "Discover YouTube creators in any region. Find local influencers for your marketing campaigns.",
};

export default function Page() {
  return <ToolContent />;
}
