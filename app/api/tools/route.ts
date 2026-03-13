import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/tools/rate-limit";
import { TOOL_HANDLERS } from "@/lib/tools/handlers";
import type { ToolInput } from "@/lib/tools/types";

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Sign up for free to get more tool uses.", retryAfter: limit.retryAfter },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { tool, ...inputs } = body as { tool: string } & ToolInput;

    if (!tool) {
      return NextResponse.json({ error: "Missing tool parameter" }, { status: 400 });
    }

    const handler = TOOL_HANDLERS[tool];
    if (!handler) {
      return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }

    const result = await handler(inputs);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Tool execution failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
