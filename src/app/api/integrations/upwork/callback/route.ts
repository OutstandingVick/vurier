import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/integrations/upwork/oauth";
import { storeUpworkConnection } from "@/integrations/upwork/connection-service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = await cookies();
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const expectedState = store.get("upwork_oauth_state")?.value;
  const verifier = store.get("upwork_pkce_verifier")?.value;
  store.delete("upwork_oauth_state");
  store.delete("upwork_pkce_verifier");
  if (!state || !code || !verifier || state !== expectedState) return NextResponse.redirect(new URL("/dashboard/settings?upwork=invalid_state", url.origin));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth/sign-in", url.origin));
  try {
    const tokens = await exchangeAuthorizationCode(code, verifier);
    await storeUpworkConnection(user.id, tokens);
    return NextResponse.redirect(new URL("/dashboard/settings?upwork=connected", url.origin));
  } catch {
    return NextResponse.redirect(new URL("/dashboard/settings?upwork=error", url.origin));
  }
}
