import { NextResponse } from "next/server";
import { OAUTH_CONFIGS, getClientId, getCallbackUrl } from "@/lib/oauth";
import crypto from "crypto";

export async function GET() {
  const config = OAUTH_CONFIGS.tiktok;
  const clientId = getClientId("tiktok");
  if (!clientId) {
    return NextResponse.json({ error: "TikTok OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

  const params = new URLSearchParams({
    client_key: clientId,
    response_type: "code",
    scope: config.scopes.join(","),
    redirect_uri: getCallbackUrl("tiktok"),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
  response.cookies.set("tiktok_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  response.cookies.set("oauth_state_tiktok", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
