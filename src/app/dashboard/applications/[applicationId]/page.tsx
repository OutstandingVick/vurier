import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { markReady } from "@/app/dashboard/applications/actions";
import { ApplicationStatusBadge } from "@/components/applications/status-badge";
import { ApprovalPanel } from "@/components/applications/approval-panel";
import { ManualPackage } from "@/components/applications/manual-package";
import { StatusControls } from "@/components/applications/status-controls";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { SyncStatusForm } from "@/components/applications/sync-status-form";
import { PageShell } from "@/components/dashboard/page-shell";
import type {
  ApplicationPackage,
  ApplicationState,
} from "@/core/applications/types";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) notFound();
  const [{ data: app }, { data: history }] = await Promise.all([
    client
      .from("applications")
      .select("*,jobs(title)")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle(),
    client
      .from("application_status_history")
      .select("id,to_status,source,note,created_at")
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  if (!app) notFound();
  const pkg = app.package as ApplicationPackage;
  return (
    <PageShell
      title={app.jobs?.title ?? "Application"}
      description="Exact-version approval and tracking"
    >
      <div className="space-y-6">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted"
          href="/dashboard/applications"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to applications
        </Link>
        <section className="rounded-2xl bg-surface p-5 shadow-card">
          <ApplicationStatusBadge status={app.status as ApplicationState} />
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Final bid</dt>
              <dd className="font-semibold">
                {app.bid_amount === null
                  ? "Unavailable"
                  : `$${Number(app.bid_amount).toLocaleString()}`}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Application Connects</dt>
              <dd className="font-semibold">
                {app.connects_cost ?? "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Boost Connects</dt>
              <dd className="font-semibold">{app.boost_connects}</dd>
            </div>
          </dl>
        </section>
        {app.status === "draft" ? (
          <form action={markReady}>
            <input type="hidden" name="applicationId" value={app.id} />
            <button className="button-primary" type="submit">
              Ready for review
            </button>
          </form>
        ) : null}
        <ApprovalPanel application={app} />
        <ManualPackage
          value={pkg}
          enabled={app.manual_apply || app.status === "approved"}
        />
        <section className="rounded-2xl border bg-surface p-5">
          <h2 className="font-semibold">Cover letter</h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7">
            {pkg.coverLetter}
          </pre>
        </section>
        {app.external_id ? <SyncStatusForm applicationId={app.id} /> : null}
        {app.manual_apply ||
        ["submitted", "viewed", "interviewing"].includes(app.status) ? (
          <StatusControls applicationId={app.id} />
        ) : null}
        <ApplicationTimeline history={(history ?? []) as never[]} />
      </div>
    </PageShell>
  );
}
