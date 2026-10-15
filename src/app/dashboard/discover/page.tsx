import Link from "next/link";
import { FileInput, SearchX } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { DisconnectedState } from "@/components/jobs/discovery-status";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchForm } from "@/components/jobs/search-form";
import { Pagination } from "@/components/jobs/pagination";
import { SaveSearchForm } from "@/components/jobs/save-search-form";
import { SavedSearches } from "@/components/jobs/saved-searches";
import { SyncJobsButton } from "@/components/jobs/sync-jobs-button";
import { loadDiscovery } from "@/core/jobs/discovery-loader";
import { parseSearchParams } from "@/core/jobs/search-params";
import { hasSupabaseEnv, hasUpworkEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseSearchParams(await searchParams);
  const discovery = await loadDiscovery(filters);
  let savedSearches: Array<{ id: string; name: string; filters: Record<string, unknown> }> = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const { data } = await client.from("saved_searches").select("id,name,filters").order("updated_at", { ascending: false }).limit(8);
    savedSearches = (data ?? []) as typeof savedSearches;
  }
  const activeFilters = Boolean(filters.query || filters.category || filters.jobType !== "all" || filters.experienceLevel !== "all" || filters.paymentVerified !== "all" || filters.proposalCount !== "all" || filters.minimumBudget !== undefined || filters.maximumAgeHours !== undefined);
  return <PageShell title="Discover jobs" description="Search authorized and manually imported opportunities"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted"><span className="font-semibold tabular-nums text-foreground">{discovery.count}</span> opportunities</p><div className="flex flex-wrap gap-2">{discovery.connected ? <SyncJobsButton filters={filters} /> : null}<Link className="button-secondary" href="/dashboard/discover/import"><FileInput className="size-4" aria-hidden="true" />Import manually</Link></div></div>{!discovery.connected && discovery.count === 0 ? <DisconnectedState configured={hasUpworkEnv()} /> : <><JobSearchForm filters={filters} /><div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><SaveSearchForm filters={filters} /><SavedSearches searches={savedSearches} /></div>{discovery.jobs.length ? <section className="mt-6 space-y-4" aria-label="Job results">{discovery.jobs.map((job) => <JobCard job={job} key={job.id} />)}<Pagination filters={filters} count={discovery.count} /></section> : <div className="mt-6"><EmptyState icon={SearchX} title={activeFilters ? "No matching opportunities" : "No opportunities yet"} description={activeFilters ? "Try broader keywords or clear one or more filters." : "Connect authorized discovery or import an opportunity from details you provide."} action={activeFilters ? <Link className="button-secondary" href="/dashboard/discover">Clear filters</Link> : <Link className="button-secondary" href="/dashboard/discover/import">Import opportunity</Link>} /></div>}</>}</PageShell>;
}
