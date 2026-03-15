"use client";

import { useState } from "react";
import AnalyzePanel from "@/components/AnalyzePanel";

interface SavedIdea {
  title: string;
  angle: string;
  hook: string;
  postType?: string;
  savedAt: string;
}

export default function AnalyzePage() {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);

  const handleCreatePrefill = (prefill: { topic: string; angle: string; hook: string; postType: string }) => {
    // Store prefill in sessionStorage so Create page can pick it up
    sessionStorage.setItem("signal_create_prefill", JSON.stringify(prefill));
    window.location.href = "/create";
  };

  return (
    <AnalyzePanel
      savedIdeas={savedIdeas}
      setSavedIdeas={setSavedIdeas}
      setCreatePrefill={handleCreatePrefill}
    />
  );
}
