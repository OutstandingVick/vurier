import { UpworkRateLimitError } from "./errors";
import { createAdminClient } from "@/lib/supabase/admin";
export async function consumeUpworkRateLimit(userId: string) {
  const { error } = await createAdminClient().rpc(
    "consume_provider_rate_limit",
    {
      p_user_id: userId,
      p_provider: "upwork",
      p_capacity: 8,
      p_refill_per_second: 1,
    },
  );
  if (error) throw new UpworkRateLimitError(1);
}
