import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Find Instagram Influencers by Niche | SIGNAL",
  description:
    "Discover Instagram influencers in any niche. Enter a keyword and find the top creators.",
};

export default function Page() {
  return <ToolContent />;
}
