import type { SupabaseClient } from "@supabase/supabase-js";
export async function notify(
  client: SupabaseClient,
  userId: string,
  input: {
    kind: string;
    title: string;
    message: string;
    applicationId?: string;
  },
) {
  await client.from("notifications").insert({
    user_id: userId,
    kind: input.kind,
    title: input.title,
    message: input.message,
    resource_type: input.applicationId ? "application" : null,
    resource_id: input.applicationId ?? null,
  });
}
