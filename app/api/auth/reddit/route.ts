import { NextResponse } from "next/server";
import { OAUTH_CONFIGS, getClientId, getCallbackUrl } from "@/lib/oauth";
import crypto from "crypto";

export async function GET() {
  const config = OAUTH_CONFIGS.reddit;
  const clientId = getClientId("reddit");
  if (!clientId) {
    return NextResponse.json({ error: "Reddit OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
    redirect_uri: getCallbackUrl("reddit"),
    duration: "permanent",
    scope: config.scopes.join(" "),
  });

  return NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
}
