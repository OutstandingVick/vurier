"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { jobSearchSchema } from "@/core/jobs/schema";
import { createClient } from "@/lib/supabase/server";

export type SavedSearchState = { error?: string; message?: string };

export async function saveSearch(_: SavedSearchState, formData: FormData): Promise<SavedSearchState> {
  const name = z.string().trim().min(1, "Name this search.").max(80).safeParse(formData.get("name"));
  const raw = formData.get("filters");
  if (!name.success || typeof raw !== "string") return { error: name.success ? "Search filters are invalid." : name.error.issues[0]?.message };
  let filters: unknown;
  try { filters = JSON.parse(raw); } catch { return { error: "Search filters are invalid." }; }
  const parsed = jobSearchSchema.safeParse(filters);
  if (!parsed.success) return { error: "Search filters are invalid." };
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in and try again." };
  const { error } = await client.from("saved_searches").insert({ user_id: user.id, name: name.data, query: parsed.data.query ?? null, filters: parsed.data });
  if (error) return { error: "Unable to save this search. Try again." };
  revalidatePath("/dashboard/discover");
  return { message: "Search saved." };
}

export async function deleteSavedSearch(id: string) {
  const searchId = z.string().uuid().parse(id);
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;
  await client.from("saved_searches").delete().eq("id", searchId).eq("user_id", user.id);
  revalidatePath("/dashboard/discover");
}
