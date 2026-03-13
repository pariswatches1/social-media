import type { Metadata } from "next";
import ToolContent from "./ToolContent";

export const metadata: Metadata = {
  title: "Free Instagram Account Audit Tool | SIGNAL",
  description:
    "Audit any Instagram account for free. Get a health score, engagement analysis, and AI recommendations.",
};

export default function ToolPage() {
  return <ToolContent />;
}
