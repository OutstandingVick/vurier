import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  CircleDollarSign,
  ExternalLink,
  EyeOff,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { setJobState } from "@/app/dashboard/discover/actions";
import { PageShell } from "@/components/dashboard/page-shell";
import {
  formatBudget,
  formatMoney,
  formatRelativeTime,
  proposalLabels,
} from "@/core/jobs/format";
import { JOB_FEED_SELECT, toJobFeedItem } from "@/core/jobs/view-model";
import { createClient } from "@/lib/supabase/server";
import { upworkCacheCutoff } from "@/core/jobs/cache-policy";

export const instant = false;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) notFound();
  const { data } = await client
    .from("jobs")
    .select(JOB_FEED_SELECT)
    .eq("id", jobId)
    .eq("user_id", user.id)
    .or(`source.eq.manual,retrieved_at.gte.${upworkCacheCutoff()}`)
    .maybeSingle();
  if (!data) notFound();
  const job = toJobFeedItem(data as Record<string, unknown>);
  const update = async (
    state: "bookmarked" | "hidden" | "tracking" | "none",
  ) => {
    "use server";
    await setJobState(job.id, state);
  };
  return (
    <PageShell
      title="Opportunity details"
      description="Review source data before deciding what to track"
    >
      <Link
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        href="/dashboard/discover"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to job discovery
      </Link>
      <article className="rounded-2xl bg-surface p-5 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
              <span className="rounded-full bg-surface-muted px-2.5 py-1">
                {job.source === "manual" ? "Manual import" : "Upwork API"}
              </span>
              <span className="rounded-full bg-surface-muted px-2.5 py-1">
                {formatRelativeTime(job.published_at)}
              </span>
            </div>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              {job.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <form
              action={update.bind(
                null,
                job.state === "bookmarked" ? "none" : "bookmarked",
              )}
            >
              <button className="button-secondary" type="submit">
                <Bookmark
                  className="size-4"
                  fill={job.state === "bookmarked" ? "currentColor" : "none"}
                  aria-hidden="true"
                />
                {job.state === "bookmarked" ? "Bookmarked" : "Bookmark"}
              </button>
            </form>
            <form action={update.bind(null, "tracking")}>
              <button className="button-primary" type="submit">
                Track opportunity
              </button>
            </form>
          </div>
        </div>
        <dl className="grid gap-4 border-b py-6 sm:grid-cols-2 xl:grid-cols-4">
          <Fact
            icon={CircleDollarSign}
            label="Budget"
            value={formatBudget(job)}
          />
          <Fact
            icon={BriefcaseBusiness}
            label="Experience"
            value={
              job.experience_level === "unknown"
                ? "Unavailable"
                : job.experience_level
            }
          />
          <Fact
            icon={ShieldCheck}
            label="Client payment"
            value={
              job.client_payment_verification === "verified"
                ? "Verified"
                : job.client_payment_verification === "unverified"
                  ? "Unverified"
                  : "Unavailable"
            }
          />
          <Fact
            icon={MapPin}
            label="Client location"
            value={job.client_country ?? "Unavailable"}
          />
        </dl>
        <div className="grid gap-8 py-6 lg:grid-cols-[1fr_18rem]">
          <section>
            <h2 className="text-lg font-semibold">Job description</h2>
            <div className="mt-4 whitespace-pre-wrap text-pretty text-sm leading-7 text-muted">
              {job.description}
            </div>
            {job.skills.length ? (
              <>
                <h3 className="mt-8 text-sm font-semibold">Skills</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <li
                      className="rounded-lg bg-surface-muted px-3 py-1.5 text-sm text-muted"
                      key={skill}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
          <aside className="rounded-2xl bg-surface-muted p-5">
            <h2 className="text-sm font-semibold">Client and competition</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <Detail
                label="Proposals"
                value={
                  proposalLabels[
                    job.proposal_count as keyof typeof proposalLabels
                  ] ?? "Unavailable"
                }
              />
              <Detail
                label="Client rating"
                value={
                  job.client_rating !== null
                    ? `${job.client_rating.toFixed(1)} out of 5`
                    : "Unavailable"
                }
              />
              <Detail
                label="Client spend"
                value={
                  formatMoney(job.client_spend, job.currency ?? "USD") ??
                  "Unavailable"
                }
              />
              <Detail
                label="Retrieved"
                value={new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(job.retrieved_at))}
              />
            </dl>
            {job.missing_fields.length ? (
              <p className="mt-5 text-xs leading-5 text-muted">
                Some fields were unavailable from this source:{" "}
                {job.missing_fields.join(", ").replaceAll("_", " ")}.
              </p>
            ) : null}
          </aside>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <form action={update.bind(null, "hidden")}>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-muted"
              type="submit"
            >
              <EyeOff className="size-4" aria-hidden="true" />
              Hide opportunity
            </button>
          </form>
          {job.source_url ? (
            <a
              className="button-secondary"
              href={job.source_url}
              target="_blank"
              rel="noreferrer"
            >
              Open original Upwork job
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-sm text-muted">Source link unavailable</span>
          )}
        </div>
      </article>
    </PageShell>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 text-muted" aria-hidden="true" />
      <div>
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-1 text-sm font-semibold capitalize">{value}</dd>
      </div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
