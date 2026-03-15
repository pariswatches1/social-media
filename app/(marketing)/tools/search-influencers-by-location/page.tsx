import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Search Instagram Influencers by Location | SIGNAL",
  description:
    "Find Instagram influencers in any city or country. AI-powered search helps you discover local creators.",
};

export default function Page() {
  return <ToolContent />;
}
