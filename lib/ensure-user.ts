import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Ensures a User record exists in the database for the given Clerk ID.
 * Uses upsert to create the user on first visit (lazy creation).
 * Fetches real email from Clerk — never generates fake emails.
 */
export async function ensureUser(clerkId: string) {
  // Try to find existing user first (fast path)
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  // User doesn't exist — fetch real email from Clerk
  let email = "";
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    email =
      clerkUser.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "";
  } catch {
    // If Clerk API fails, use empty string — better than a fake email
    email = "";
  }

  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email },
  });
}
