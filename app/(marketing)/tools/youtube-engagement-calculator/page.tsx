import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free YouTube Engagement Rate Calculator | SIGNAL",
  description:
    "Calculate the engagement rate of any YouTube channel. Get estimated views, likes, and comments analysis.",
};

export default function Page() {
  return <ToolContent />;
}
