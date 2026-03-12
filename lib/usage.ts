import prisma from "./prisma";

interface UsageResult {
  allowed: boolean;
  reason?: string;
  used?: number;
  limit?: number;
  plan?: string;
}

export async function checkAndIncrementUsage(
  clerkId: string
): Promise<UsageResult> {
  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    return { allowed: false, reason: "USER_NOT_FOUND" };
  }

  // Reset monthly counter if needed
  const now = new Date();
  const resetDate = new Date(user.analysesReset);
  const monthPassed =
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear();

  if (monthPassed) {
    await prisma.user.update({
      where: { clerkId },
      data: { analysesUsed: 0, analysesReset: now },
    });
    return { allowed: true, used: 0, limit: getLimit(user.plan), plan: user.plan };
  }

  const limit = getLimit(user.plan);

  if (user.plan === "FREE" && user.analysesUsed >= limit) {
    return {
      allowed: false,
      reason: "LIMIT_REACHED",
      used: user.analysesUsed,
      limit,
      plan: user.plan,
    };
  }

  await prisma.user.update({
    where: { clerkId },
    data: { analysesUsed: { increment: 1 } },
  });

  return {
    allowed: true,
    used: user.analysesUsed + 1,
    limit,
    plan: user.plan,
  };
}

export async function getUsage(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  const limit = getLimit(user.plan);
  return {
    used: user.analysesUsed,
    limit,
    plan: user.plan,
    resetDate: user.analysesReset,
  };
}

function getLimit(plan: string): number {
  switch (plan) {
    case "PRO":
    case "AGENCY":
      return 999999; // Unlimited
    default:
      return 3;
  }
}

export function getPlanLimits(plan: string) {
  switch (plan) {
    case "PRO":
      return { analyses: 999999, platforms: 7, variations: 3 };
    case "AGENCY":
      return { analyses: 999999, platforms: 7, variations: 3, teamSeats: 5 };
    default:
      return { analyses: 3, platforms: 1, variations: 1 };
  }
}
