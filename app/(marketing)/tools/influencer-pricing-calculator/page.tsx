import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Influencer Pricing Calculator | SIGNAL",
  description:
    "Calculate how much influencers charge. Estimate rates for posts, stories, and reels based on followers and engagement.",
};

export default function Page() {
  return <ToolContent />;
}
