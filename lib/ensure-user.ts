import prisma from "@/lib/prisma";

/**
 * Ensures a User record exists in the database for the given Clerk ID.
 * Uses upsert to create the user on first visit (lazy creation).
 */
export async function ensureUser(clerkId: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email: `${clerkId}@signal.user` },
  });
}
