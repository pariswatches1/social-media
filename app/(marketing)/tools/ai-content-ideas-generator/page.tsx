import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "AI Content Ideas Generator for Instagram | SIGNAL",
  description:
    "Generate viral content ideas for Instagram with AI. Enter your niche and get 10 creative post ideas instantly.",
};

export default function Page() {
  return <ToolContent />;
}
