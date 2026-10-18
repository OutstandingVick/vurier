"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function updateNotification(
  formData: FormData,
  values: Record<string, string>,
) {
  const id = z.string().uuid().safeParse(formData.get("notificationId"));
  if (!id.success) return;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return;
  await client
    .from("notifications")
    .update(values)
    .eq("id", id.data)
    .eq("user_id", user.id);
  revalidatePath("/dashboard/notifications");
}

export async function markNotificationRead(formData: FormData) {
  await updateNotification(formData, { read_at: new Date().toISOString() });
}
export async function dismissNotification(formData: FormData) {
  await updateNotification(formData, {
    dismissed_at: new Date().toISOString(),
  });
}
export async function markAllNotificationsRead() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user)
    await client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  revalidatePath("/dashboard/notifications");
}
