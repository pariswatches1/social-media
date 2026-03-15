import prisma from "./prisma";

type ActivityType =
  | "ANALYSIS"
  | "GENERATION"
  | "CONTENT_SAVED"
  | "CONTENT_SCHEDULED"
  | "CONTENT_PUBLISHED"
  | "BRAND_PROFILE_CREATED"
  | "BRAND_PROFILE_UPDATED"
  | "CREATOR_ADDED"
  | "CAMPAIGN_CREATED"
  | "CAMPAIGN_UPDATED"
  | "OUTREACH_SENT"
  | "DELIVERABLE_SUBMITTED"
  | "DELIVERABLE_APPROVED"
  | "VIRALITY_SCORED";

export async function logActivity(
  userId: string,
  type: ActivityType,
  title: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        title,
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (err) {
    // Log but don't throw — activity logging should never break user flows
    if (process.env.NODE_ENV === "development") {
      console.error("[logActivity] failed:", err);
    }
  }
}
