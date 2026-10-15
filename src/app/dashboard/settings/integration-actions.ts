"use server";

import { revalidatePath } from "next/cache";
import { disconnectUpwork } from "@/integrations/upwork/connection-service";
import { createClient } from "@/lib/supabase/server";

export async function disconnectUpworkAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await disconnectUpwork(user.id);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/discover");
}
