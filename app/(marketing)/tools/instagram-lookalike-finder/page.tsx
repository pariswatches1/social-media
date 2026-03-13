import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Find Instagram Lookalike Influencers | SIGNAL",
  description:
    "Find similar Instagram accounts to any creator. AI suggests lookalike influencers based on content patterns.",
};

export default function Page() {
  return <ToolContent />;
}
