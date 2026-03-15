/**
 * Centralized structured logging for SIGNAL.
 *
 * In production, these logs appear in Vercel Runtime Logs
 * (Dashboard → Project → Logs) and can be filtered by level.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.error("payment_failed", { userId, plan, error: err.message });
 *   logger.warn("token_expiring", { platform, accountId });
 *   logger.info("post_published", { postId, platform });
 */

type LogLevel = "info" | "warn" | "error" | "fatal";

interface LogEntry {
  level: LogLevel;
  event: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };

  const message = `[SIGNAL:${level.toUpperCase()}] ${event} ${JSON.stringify(data || {})}`;

  switch (level) {
    case "fatal":
    case "error":
      console.error(message);
      break;
    case "warn":
      console.warn(message);
      break;
    default:
      console.log(message);
  }

  return entry;
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => log("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => log("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => log("error", event, data),
  fatal: (event: string, data?: Record<string, unknown>) => log("fatal", event, data),

  /**
   * Log an API route error with standardized format.
   */
  apiError: (route: string, error: unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return log("error", `api_error:${route}`, {
      message: errorMessage,
      ...(errorStack && { stack: errorStack }),
      ...context,
    });
  },

  /**
   * Log an OAuth error.
   */
  oauthError: (platform: string, step: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return log("error", `oauth_error:${platform}`, {
      step,
      message: errorMessage,
    });
  },

  /**
   * Log a publish failure.
   */
  publishError: (postId: string, platform: string, error: string) => {
    return log("error", "publish_failed", { postId, platform, error });
  },

  /**
   * Log a Stripe/payment event.
   */
  payment: (event: string, data?: Record<string, unknown>) => {
    return log("info", `payment:${event}`, data);
  },
};
