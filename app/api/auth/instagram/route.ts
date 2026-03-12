import { NextResponse } from "next/server";
import { OAUTH_CONFIGS, getClientId, getCallbackUrl } from "@/lib/oauth";
import crypto from "crypto";

export async function GET() {
  const config = OAUTH_CONFIGS.instagram;
  const clientId = getClientId("instagram");
  if (!clientId) {
    return NextResponse.json({ error: "Instagram OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl("instagram"),
    scope: config.scopes.join(","),
    response_type: "code",
    state,
  });

  return NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
}
