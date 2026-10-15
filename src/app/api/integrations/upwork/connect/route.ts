import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizationUrl, createPkcePair } from "@/integrations/upwork/oauth";
import { hasUpworkEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!hasUpworkEnv()) return NextResponse.redirect(new URL("/dashboard/settings?upwork=unavailable", request.url));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  const state = randomBytes(32).toString("base64url");
  const pkce = createPkcePair();
  const store = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: 600, path: "/api/integrations/upwork/callback" };
  store.set("upwork_oauth_state", state, options);
  store.set("upwork_pkce_verifier", pkce.verifier, options);
  return NextResponse.redirect(buildAuthorizationUrl(state, pkce.challenge));
}
