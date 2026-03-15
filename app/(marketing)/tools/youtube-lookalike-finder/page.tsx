import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Find YouTube Lookalike Channels | SIGNAL",
  description:
    "Find channels similar to any YouTube creator. AI suggests lookalike channels based on content patterns.",
};

export default function Page() {
  return <ToolContent />;
}
