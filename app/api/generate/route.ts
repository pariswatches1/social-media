import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/anthropic";
import { getPlanLimits } from "@/lib/usage";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

const PLATFORMS: Record<string, { label: string; limit: number }> = {
  instagram: { label: "Instagram", limit: 2200 },
  linkedin: { label: "LinkedIn", limit: 3000 },
  twitter: { label: "X / Twitter", limit: 280 },
  tiktok: { label: "TikTok", limit: 2200 },
  reddit: { label: "Reddit", limit: 40000 },
  facebook: { label: "Facebook", limit: 63206 },
  snapchat: { label: "Snapchat", limit: 250 },
};

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const body = await request.json();
    const { topic, angle, hook, tone, postType, platforms, variations, brandVoice } = body;

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    // Enforce plan limits
    const limits = getPlanLimits(user.plan);
    const allowedPlatforms = (platforms as string[]).slice(0, limits.platforms);
    const allowedVariations = Math.min(variations || 1, limits.variations);

    const platformList = allowedPlatforms
      .map((id: string) => PLATFORMS[id]?.label || id)
      .join(", ");

    const raw = await callClaude(
      `You are an elite social media copywriter and content strategist. Respond ONLY with valid JSON. No markdown fences.`,
      `Create high-performing social media content.

TOPIC: ${topic}
ANGLE: ${angle || "best creative angle you see fit"}
HOOK IDEA: ${hook || "create a strong hook"}
TONE: ${tone || "Authority"}
POST TYPE: ${postType || "Text Post"}
PLATFORMS: ${platformList}
BRAND VOICE NOTES: ${brandVoice || "none"}
VARIATIONS REQUESTED: ${allowedVariations}

Return JSON:
{
  "viralityScore": 85,
  "bestTimeToPost": "Tuesday-Thursday 7-9am or 6-8pm",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "imagePrompt": "detailed DALL-E/Midjourney style prompt for a matching image",
  "platforms": {
    ${allowedPlatforms
      .map((pid: string) => {
        const p = PLATFORMS[pid];
        const varSnippets = [];
        for (let i = 0; i < allowedVariations; i++) {
          varSnippets.push(
            `{ "copy": "full post text variation ${i + 1}, optimized for ${p?.label} specifically", "hook": "hook line ${i + 1}", "cta": "call to action ${i + 1}" }`
          );
        }
        return `"${pid}": { "charLimit": ${p?.limit}, "variations": [${varSnippets.join(", ")}] }`;
      })
      .join(",\n    ")}
  }
}

Make the copy genuinely great - specific, not generic. Each platform should have distinct formatting appropriate for that platform.`
    );

    const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[/api/generate]", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
