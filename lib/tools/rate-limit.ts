const store = new Map<string, { count: number; resetAt: number }>();

const MAX_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + DAY_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_PER_DAY) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}
