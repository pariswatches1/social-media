import { NextResponse } from "next/server";
import { OAUTH_CONFIGS, getClientId, getCallbackUrl } from "@/lib/oauth";
import crypto from "crypto";

export async function GET() {
  const config = OAUTH_CONFIGS.twitter;
  const clientId = getClientId("twitter");
  if (!clientId) {
    return NextResponse.json({ error: "Twitter OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

  // Twitter requires PKCE — store code_verifier in a cookie
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getCallbackUrl("twitter"),
    scope: config.scopes.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
  response.cookies.set("twitter_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
