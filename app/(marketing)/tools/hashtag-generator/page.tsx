import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free Instagram Hashtag Generator | SIGNAL",
  description:
    "Generate the perfect hashtags for your Instagram posts. Enter a topic and get 30 categorized hashtags.",
};

export default function Page() {
  return <ToolContent />;
}
