import type { Metadata } from "next";
import ComparisonContent from "./ComparisonContent";

export const metadata: Metadata = {
  title: "SIGNAL vs GRIN — AI Social Media Intelligence for 97% Less",
  description:
    "Compare SIGNAL vs GRIN. Get AI content generation, creator discovery, virality scoring, and auto-publishing for $29/mo vs GRIN's $999+/mo. 14-day free trial.",
};

export default function SignalVsGrinPage() {
  return <ComparisonContent />;
}
