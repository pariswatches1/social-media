"use client";

import { useState, useEffect } from "react";
import CreatePanel from "@/components/CreatePanel";

interface Prefill {
  topic?: string;
  angle?: string;
  hook?: string;
  postType?: string;
}

export default function CreatePage() {
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  useEffect(() => {
    // Check for prefill data from the Analyze tab
    const stored = sessionStorage.getItem("signal_create_prefill");
    if (stored) {
      try {
        setPrefill(JSON.parse(stored));
      } catch {
        /* JSON parse failed, ignore prefill */
      }
      sessionStorage.removeItem("signal_create_prefill");
    }
  }, []);

  return (
    <CreatePanel prefill={prefill} clearPrefill={() => setPrefill(null)} />
  );
}
