import prisma from "./prisma";

type ActivityType =
  | "ANALYSIS"
  | "GENERATION"
  | "CONTENT_SAVED"
  | "CONTENT_SCHEDULED"
  | "CONTENT_PUBLISHED"
  | "BRAND_PROFILE_CREATED"
  | "BRAND_PROFILE_UPDATED";

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
    console.error("[logActivity] failed:", err);
  }
}
