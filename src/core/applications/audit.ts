import type { SupabaseClient } from "@supabase/supabase-js";
export async function auditApplication(
  client: SupabaseClient,
  userId: string,
  applicationId: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  await client.from("application_audit_logs").insert({
    user_id: userId,
    application_id: applicationId,
    action,
    metadata,
  });
}
