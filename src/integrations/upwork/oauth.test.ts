import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAuthorizationUrl,
  createPkcePair,
  exchangeAuthorizationCode,
} from "@/integrations/upwork/oauth";

afterEach(() => vi.unstubAllEnvs());
function configure() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  vi.stubEnv("DEEPSEEK_API_KEY", "deepseek");
  vi.stubEnv("UPWORK_CLIENT_ID", "client");
  vi.stubEnv("UPWORK_CLIENT_SECRET", "secret");
  vi.stubEnv("UPWORK_REDIRECT_URI", "https://app.test/callback");
  vi.stubEnv("UPWORK_API_BASE_URL", "https://api.upwork.test");
  vi.stubEnv("UPWORK_AUTH_BASE_URL", "https://upwork.test");
}

describe("Upwork OAuth", () => {
  it("builds a state-bound PKCE authorization URL", () => {
    configure();
    const pkce = createPkcePair();
    const url = new URL(buildAuthorizationUrl("state-1", pkce.challenge));
    expect(url.searchParams.get("state")).toBe("state-1");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });
  it("exchanges authorization codes server-side", async () => {
    configure();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            access_token: "access",
            refresh_token: "refresh",
            expires_in: 3600,
          }),
          { status: 200 },
        ),
      );
    const tokens = await exchangeAuthorizationCode("code", "verifier", fetcher);
    expect(tokens.access_token).toBe("access");
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
