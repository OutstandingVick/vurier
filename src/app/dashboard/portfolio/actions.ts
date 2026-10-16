"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateEvidenceFile } from "@/core/proposals/file-validation";
export type PortfolioState = { message?: string; error?: string };
const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(3000),
  kind: z.enum([
    "project",
    "writing_sample",
    "achievement",
    "experience",
    "resume",
    "link",
  ]),
  skills: z
    .string()
    .transform((v) =>
      v
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(80)).max(40)),
  achievements: z
    .string()
    .transform((v) =>
      v
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(300)).max(20)),
  projectUrl: z.union([z.literal(""), z.string().url()]),
  repositoryUrl: z.union([z.literal(""), z.string().url()]),
  verified: z.boolean(),
});
export async function savePortfolioItem(
  _: PortfolioState,
  formData: FormData,
): Promise<PortfolioState> {
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    kind: formData.get("kind"),
    skills: formData.get("skills"),
    achievements: formData.get("achievements"),
    projectUrl: formData.get("projectUrl"),
    repositoryUrl: formData.get("repositoryUrl"),
    verified: formData.get("verified") === "on",
  });
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ?? "Check the evidence and try again.",
    };
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in and try again." };
  let filePath: string | undefined;
  const file = formData.get("file");
  if (file instanceof File && file.size) {
    const fileError = validateEvidenceFile(file);
    if (fileError) return { error: fileError };
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    filePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const upload = await client.storage
      .from("portfolio")
      .upload(filePath, file, { upsert: false });
    if (upload.error)
      return {
        error:
          "Unable to upload the file. Check the storage migration and try again.",
      };
  }
  const row = {
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    kind: parsed.data.kind,
    skills: parsed.data.skills,
    achievements: parsed.data.achievements,
    project_url: parsed.data.projectUrl || null,
    repository_url: parsed.data.repositoryUrl || null,
    verified: parsed.data.verified,
    ...(filePath ? { file_path: filePath } : {}),
  };
  const result = parsed.data.id
    ? await client
        .from("portfolio_items")
        .update(row)
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)
    : await client.from("portfolio_items").insert(row);
  if (result.error)
    return {
      error: "Unable to save evidence. Check your connection and try again.",
    };
  revalidatePath("/dashboard/portfolio");
  return { message: "Portfolio evidence saved." };
}
export async function deletePortfolioItem(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return;
  const { data } = await client
    .from("portfolio_items")
    .select("file_path")
    .eq("id", id.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (data?.file_path)
    await client.storage.from("portfolio").remove([data.file_path]);
  await client
    .from("portfolio_items")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);
  revalidatePath("/dashboard/portfolio");
}
