import { createHash, randomBytes } from "node:crypto";
import { getServerEnv } from "@/lib/env";
import { UpworkApiError } from "@/integrations/upwork/errors";

export type PkcePair = { verifier: string; challenge: string };
export type UpworkTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export function oauthUserMatches(
  initiatingUserId: string | undefined,
  currentUserId: string,
) {
  return Boolean(initiatingUserId && initiatingUserId === currentUserId);
}

export function createPkcePair(): PkcePair {
  const verifier = randomBytes(48).toString("base64url");
  return {
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
  };
}

export function buildAuthorizationUrl(state: string, challenge: string) {
  const env = getServerEnv();
  if (!env.UPWORK_CLIENT_ID || !env.UPWORK_REDIRECT_URI)
    throw new UpworkApiError("Upwork integration is not configured.");
  const url = new URL(
    "/ab/account-security/oauth2/authorize",
    env.UPWORK_AUTH_BASE_URL,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.UPWORK_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.UPWORK_REDIRECT_URI);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (env.UPWORK_SCOPES) url.searchParams.set("scope", env.UPWORK_SCOPES);
  return url.toString();
}

async function tokenRequest(
  params: URLSearchParams,
  fetcher: typeof fetch,
): Promise<UpworkTokenResponse> {
  const env = getServerEnv();
  if (!env.UPWORK_CLIENT_ID || !env.UPWORK_CLIENT_SECRET)
    throw new UpworkApiError("Upwork integration is not configured.");
  const response = await fetcher(
    new URL("/api/v3/oauth2/token", env.UPWORK_AUTH_BASE_URL),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${env.UPWORK_CLIENT_ID}:${env.UPWORK_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: params,
    },
  );
  const payload = (await response
    .json()
    .catch(() => ({}))) as Partial<UpworkTokenResponse> & {
    error_description?: string;
  };
  if (!response.ok || !payload.access_token)
    throw new UpworkApiError(
      payload.error_description ?? "Upwork authentication failed.",
      response.status,
    );
  return payload as UpworkTokenResponse;
}

export function exchangeAuthorizationCode(
  code: string,
  verifier: string,
  fetcher: typeof fetch = fetch,
) {
  const env = getServerEnv();
  return tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: env.UPWORK_REDIRECT_URI ?? "",
    }),
    fetcher,
  );
}

export function refreshAccessToken(
  refreshToken: string,
  fetcher: typeof fetch = fetch,
) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    fetcher,
  );
}
