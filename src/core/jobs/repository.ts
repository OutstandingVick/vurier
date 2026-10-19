import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedJob } from "@/core/jobs/types";

export function toJobRow(
  userId: string,
  job: NormalizedJob,
  sourceId?: string,
) {
  return {
    user_id: userId,
    source: job.source,
    source_id: sourceId ?? null,
    external_id: job.externalId,
    source_url: job.sourceUrl,
    title: job.title,
    description: job.description,
    category: job.category,
    job_type: job.jobType,
    budget_min: job.budgetMin,
    budget_max: job.budgetMax,
    hourly_min: job.hourlyMin,
    hourly_max: job.hourlyMax,
    currency: job.currency,
    experience_level: job.experienceLevel,
    skills: job.skills,
    client_country: job.clientCountry,
    client_payment_verification: job.clientPaymentVerification,
    client_rating: job.clientRating,
    client_spend: job.clientSpend,
    proposal_count: job.proposalCount,
    published_at: job.publishedAt,
    retrieved_at: job.retrievedAt,
    missing_fields: job.missingFields,
    source_payload: job.sourcePayload,
  };
}

export async function upsertJobs(
  client: SupabaseClient,
  userId: string,
  jobs: NormalizedJob[],
  sourceId?: string,
) {
  if (jobs.length === 0) return [];
  const rows = jobs.map((job) => toJobRow(userId, job, sourceId));
  const { data, error } = await client
    .from("jobs")
    .upsert(rows, {
      onConflict: "user_id,source,external_id",
      ignoreDuplicates: false,
    })
    .select("id,external_id");
  if (error) throw error;
  return data ?? [];
}
