import { NextResponse } from "next/server";
import { OAUTH_CONFIGS, getClientId, getCallbackUrl } from "@/lib/oauth";
import crypto from "crypto";

export async function GET() {
  const config = OAUTH_CONFIGS.facebook;
  const clientId = getClientId("facebook");
  if (!clientId) {
    return NextResponse.json({ error: "Facebook OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl("facebook"),
    scope: config.scopes.join(","),
    response_type: "code",
    state,
  });

  return NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
}
