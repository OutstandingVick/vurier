import Link from "next/link";
import { Bookmark, BriefcaseBusiness } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { JobCard } from "@/components/jobs/job-card";
import { JOB_FEED_SELECT, toJobFeedItem } from "@/core/jobs/view-model";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

const validStates = ["saved", "bookmarked", "tracking"] as const;
export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const requested = (await searchParams).state;
  const state = validStates.includes(requested as typeof validStates[number]) ? requested! : "bookmarked";
  let jobs: ReturnType<typeof toJobFeedItem>[] = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      const { data } = await client.from("jobs").select(JOB_FEED_SELECT).eq("user_id", user.id).eq("job_user_states.state", state).order("updated_at", { ascending: false });
      jobs = (data ?? []).map((row) => toJobFeedItem(row as Record<string, unknown>)).filter((job) => job.state === state);
    }
  }
  return <PageShell title="Opportunities" description="Saved, bookmarked, and tracked jobs"><nav className="mb-5 flex flex-wrap gap-2" aria-label="Opportunity state">{validStates.map((item) => <Link className={`inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-medium ${state === item ? "bg-foreground text-background" : "border bg-surface text-muted"}`} href={`?state=${item}`} key={item}>{item === "saved" ? "Saved" : item === "bookmarked" ? "Bookmarked" : "Tracking"}</Link>)}</nav>{jobs.length ? <section className="space-y-4" aria-label={`${state} opportunities`}>{jobs.map((job) => <JobCard job={job} key={job.id} />)}</section> : <EmptyState icon={state === "bookmarked" ? Bookmark : BriefcaseBusiness} title={`No ${state} opportunities`} description="Use the controls in job discovery to organize opportunities here." action={<Link className="button-secondary" href="/dashboard/discover">Discover jobs</Link>} />}</PageShell>;
}
