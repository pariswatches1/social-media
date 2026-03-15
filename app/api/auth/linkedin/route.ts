import { NextResponse } from "next/server";
import { OAUTH_CONFIGS, getClientId, getCallbackUrl } from "@/lib/oauth";
import crypto from "crypto";

export async function GET() {
  const config = OAUTH_CONFIGS.linkedin;
  const clientId = getClientId("linkedin");
  if (!clientId) {
    return NextResponse.json({ error: "LinkedIn OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getCallbackUrl("linkedin"),
    scope: config.scopes.join(" "),
    state,
  });

  const response = NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
  response.cookies.set("oauth_state_linkedin", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
