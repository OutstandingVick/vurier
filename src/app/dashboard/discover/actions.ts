"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { manualJobSchema, jobSearchSchema } from "@/core/jobs/schema";
import { normalizeManualJob } from "@/core/jobs/manual-normalizer";
import { upsertJobs } from "@/core/jobs/repository";
import { UpworkApiClient } from "@/integrations/upwork/client";
import { getValidUpworkToken } from "@/integrations/upwork/connection-service";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; message?: string; jobId?: string };

async function authenticated() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  return { client, user };
}

export async function importManualJob(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = manualJobSchema.safeParse({
    sourceUrl: formData.get("sourceUrl"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category") || undefined,
    jobType: formData.get("jobType"),
    budgetMin: formData.get("budgetMin"),
    budgetMax: formData.get("budgetMax"),
    skills: formData.get("skills"),
  });
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Check the job details and try again.",
    };
  try {
    const { client, user } = await authenticated();
    const rows = await upsertJobs(client, user.id, [
      normalizeManualJob(parsed.data),
    ]);
    revalidatePath("/dashboard/discover");
    return {
      message: rows.length
        ? "Opportunity imported."
        : "Opportunity already exists.",
      jobId: rows[0]?.id,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message.includes("duplicate")
          ? "This opportunity is already in your feed."
          : "Unable to import this opportunity. Check the details and try again.",
    };
  }
}

const stateSchema = z.enum([
  "saved",
  "bookmarked",
  "hidden",
  "tracking",
  "none",
]);
export async function setJobState(
  jobId: string,
  state: z.infer<typeof stateSchema>,
) {
  const validId = z.string().uuid().parse(jobId);
  const validState = stateSchema.parse(state);
  const { client, user } = await authenticated();
  if (validState === "none")
    await client
      .from("job_user_states")
      .delete()
      .eq("user_id", user.id)
      .eq("job_id", validId);
  else
    await client
      .from("job_user_states")
      .upsert(
        { user_id: user.id, job_id: validId, state: validState },
        { onConflict: "user_id,job_id" },
      );
  revalidatePath("/dashboard/discover");
}

export async function syncAuthorizedJobs(
  filters: unknown,
): Promise<ActionState> {
  try {
    const parsed = jobSearchSchema.parse(filters);
    const { client, user } = await authenticated();
    const connection = await getValidUpworkToken(user.id);
    if (!connection)
      return {
        error: "Connect an authorized Upwork account before retrieving jobs.",
      };
    const result = await new UpworkApiClient().searchJobs(
      connection.accessToken,
      parsed,
      user.id,
    );
    await upsertJobs(client, user.id, result.jobs, connection.sourceId);
    revalidatePath("/dashboard/discover");
    return {
      message: `Retrieved ${result.jobs.length} authorized opportunities.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Authorized job retrieval failed.",
    };
  }
}
