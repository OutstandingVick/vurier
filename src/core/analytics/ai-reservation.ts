import type { SupabaseClient } from "@supabase/supabase-js";
export const AI_RESERVES = {
  opportunity_analysis: 0.25,
  proposal_generation: 0.25,
  demo_strategy: 0.25,
} as const;
export async function reserveAiCost(
  client: SupabaseClient,
  userId: string,
  purpose: keyof typeof AI_RESERVES,
) {
  const { data, error } = await client.rpc("reserve_ai_cost", {
    p_user_id: userId,
    p_amount_usd: AI_RESERVES[purpose],
    p_purpose: purpose,
  });
  if (error || !data)
    throw new Error(error?.message ?? "Unable to reserve AI budget.");
  return data as string;
}
export async function releaseAiCost(
  client: SupabaseClient,
  userId: string,
  reservationId: string,
) {
  const { error } = await client.rpc("release_ai_cost", {
    p_reservation_id: reservationId,
    p_user_id: userId,
  });
  if (error) throw error;
}
