import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free Instagram Engagement Rate Calculator | SIGNAL",
  description:
    "Calculate the real engagement rate of any Instagram account. Get likes, comments, and engagement breakdown — free.",
};

export default function ToolPage() {
  return <ToolContent />;
}
