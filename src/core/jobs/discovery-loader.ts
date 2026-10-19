import type { JobSearchFilters } from "@/core/jobs/types";
import { JOB_FEED_SELECT, toJobFeedItem } from "@/core/jobs/view-model";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { upworkCacheCutoff } from "@/core/jobs/cache-policy";

export async function loadDiscovery(filters: JobSearchFilters) {
  if (!hasSupabaseEnv())
    return { jobs: [], count: 0, connected: false, unavailable: true };
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    return { jobs: [], count: 0, connected: false, unavailable: false };
  const { data: hiddenStates } = await client
    .from("job_user_states")
    .select("job_id")
    .eq("user_id", user.id)
    .eq("state", "hidden");
  const hiddenIds = (hiddenStates ?? []).map((row) => row.job_id);
  let query = client
    .from("jobs")
    .select(JOB_FEED_SELECT, { count: "exact" })
    .eq("user_id", user.id);
  query = query.or(`source.eq.manual,retrieved_at.gte.${upworkCacheCutoff()}`);
  if (hiddenIds.length)
    query = query.not("id", "in", `(${hiddenIds.join(",")})`);
  if (filters.query)
    query = query.textSearch("search_document", filters.query, {
      type: "websearch",
      config: "english",
    });
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.jobType && filters.jobType !== "all")
    query = query.eq("job_type", filters.jobType);
  if (filters.experienceLevel && filters.experienceLevel !== "all")
    query = query.eq("experience_level", filters.experienceLevel);
  if (filters.paymentVerified && filters.paymentVerified !== "all")
    query = query.eq("client_payment_verification", filters.paymentVerified);
  if (filters.proposalCount && filters.proposalCount !== "all")
    query = query.eq("proposal_count", filters.proposalCount);
  if (filters.minimumBudget !== undefined)
    query = query.or(
      `budget_max.gte.${filters.minimumBudget},hourly_max.gte.${filters.minimumBudget}`,
    );
  if (filters.maximumAgeHours !== undefined)
    query = query.gte(
      "published_at",
      new Date(Date.now() - filters.maximumAgeHours * 3_600_000).toISOString(),
    );
  if (filters.sort === "budget_high")
    query = query.order("budget_max", { ascending: false, nullsFirst: false });
  else if (filters.sort === "competition_low")
    query = query.order("proposal_count", { ascending: true });
  else
    query = query
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("retrieved_at", { ascending: false });
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const { data, count, error } = await query.range(start, start + pageSize - 1);
  if (error) throw error;
  const { data: source } = await client
    .from("discovery_source_status")
    .select("status")
    .eq("user_id", user.id)
    .eq("provider", "upwork_api")
    .maybeSingle();
  return {
    jobs: (data ?? []).map((row) =>
      toJobFeedItem(row as Record<string, unknown>),
    ),
    count: count ?? 0,
    connected: source?.status === "connected",
    unavailable: false,
  };
}
