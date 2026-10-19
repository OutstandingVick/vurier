import { decryptToken, encryptToken } from "@/lib/crypto/token-vault";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  refreshAccessToken,
  type UpworkTokenResponse,
} from "@/integrations/upwork/oauth";

export async function storeUpworkConnection(
  userId: string,
  tokens: UpworkTokenResponse,
) {
  const env = getServerEnv();
  if (!env.INTEGRATION_ENCRYPTION_KEY)
    throw new Error("Integration encryption is not configured.");
  const client = createAdminClient();
  const row = {
    user_id: userId,
    provider: "upwork_api",
    status: "connected",
    encrypted_access_token: encryptToken(
      tokens.access_token,
      env.INTEGRATION_ENCRYPTION_KEY,
      `${userId}:upwork:access`,
    ),
    encrypted_refresh_token: tokens.refresh_token
      ? encryptToken(
          tokens.refresh_token,
          env.INTEGRATION_ENCRYPTION_KEY,
          `${userId}:upwork:refresh`,
        )
      : null,
    token_expires_at: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null,
    scopes: tokens.scope?.split(" ").filter(Boolean) ?? [],
    last_connected_at: new Date().toISOString(),
    last_error_code: null,
    last_error_message: null,
  };
  const { error } = await client
    .from("discovery_sources")
    .upsert(row, { onConflict: "user_id,provider" });
  if (error) throw error;
}

export async function getValidUpworkToken(userId: string) {
  const env = getServerEnv();
  if (!env.INTEGRATION_ENCRYPTION_KEY)
    throw new Error("Integration encryption is not configured.");
  const client = createAdminClient();
  const { data, error } = await client
    .from("discovery_sources")
    .select(
      "id,status,encrypted_access_token,encrypted_refresh_token,token_expires_at",
    )
    .eq("user_id", userId)
    .eq("provider", "upwork_api")
    .maybeSingle();
  if (error) throw error;
  if (!data || data.status !== "connected" || !data.encrypted_access_token)
    return null;
  const expiresSoon =
    data.token_expires_at &&
    new Date(data.token_expires_at).getTime() < Date.now() + 60_000;
  if (!expiresSoon)
    return {
      accessToken: decryptToken(
        data.encrypted_access_token,
        env.INTEGRATION_ENCRYPTION_KEY,
        `${userId}:upwork:access`,
      ),
      sourceId: data.id,
    };
  if (!data.encrypted_refresh_token) return null;
  const refreshed = await refreshAccessToken(
    decryptToken(
      data.encrypted_refresh_token,
      env.INTEGRATION_ENCRYPTION_KEY,
      `${userId}:upwork:refresh`,
    ),
  );
  await storeUpworkConnection(userId, refreshed);
  return { accessToken: refreshed.access_token, sourceId: data.id };
}

export async function disconnectUpwork(userId: string) {
  const client = createAdminClient();
  const { error } = await client
    .from("discovery_sources")
    .update({
      status: "disconnected",
      encrypted_access_token: null,
      encrypted_refresh_token: null,
      token_expires_at: null,
    })
    .eq("user_id", userId)
    .eq("provider", "upwork_api");
  if (error) throw error;
}
