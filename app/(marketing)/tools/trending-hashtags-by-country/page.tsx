import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Trending Instagram Hashtags by Country | SIGNAL",
  description:
    "Discover trending Instagram hashtags in any country. Get 30 categorized hashtags for maximum reach.",
};

export default function Page() {
  return <ToolContent />;
}
