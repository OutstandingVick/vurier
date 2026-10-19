import Link from "next/link";
import { Send } from "lucide-react";
import { ApplicationCard } from "@/components/applications/application-card";
import { NotificationsList } from "@/components/applications/notifications-list";
import { ConnectsSummary } from "@/components/applications/connects-summary";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import type { ApplicationState } from "@/core/applications/types";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { upworkCapabilities } from "@/core/applications/capabilities";
import { getValidUpworkToken } from "@/integrations/upwork/connection-service";
import {
  UpworkApiClient,
  type UpworkConnectsSummary,
} from "@/integrations/upwork/client";
export const instant = false;
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  let applications: Array<never> = [];
  let notifications: Array<never> = [];
  let connects: UpworkConnectsSummary | null = null;
  let connectsMessage = "Connect Upwork to request an authorized balance.";
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      let query = client
        .from("applications")
        .select(
          "id,status,bid_amount,connects_cost,boost_connects,updated_at,jobs(title)",
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (params.status && params.status !== "all")
        query = query.eq("status", params.status);
      const [{ data }, { data: notes }, { data: source }] = await Promise.all([
        query,
        client
          .from("notifications")
          .select("id,title,message,read_at,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        client
          .from("discovery_source_status")
          .select("scopes")
          .eq("user_id", user.id)
          .eq("provider", "upwork_api")
          .maybeSingle(),
      ]);
      applications = (data ?? []).filter(
        (item) =>
          !params.q ||
          (item.jobs as unknown as { title?: string } | null)?.title
            ?.toLowerCase()
            .includes(params.q.toLowerCase()),
      ) as never[];
      notifications = (notes ?? []) as never[];
      if (upworkCapabilities(source?.scopes ?? []).canReadConnects) {
        const token = await getValidUpworkToken(user.id);
        if (token) {
          try {
            connects = await new UpworkApiClient().getConnectsSummary(
              token.accessToken,
              user.id,
            );
            connectsMessage = "";
          } catch {
            connectsMessage =
              "Upwork did not return a balance. No value has been estimated.";
          }
        }
      } else if (source) {
        connectsMessage =
          "The connection lacks the read-only Ad Credits and Connects permission.";
      }
    }
  }
  return (
    <PageShell
      title="Applications"
      description="Approval, submission, and outcome pipeline"
    >
      <div className="space-y-6">
        <ConnectsSummary summary={connects} message={connectsMessage} />
        <NotificationsList items={notifications} />
        <section className="rounded-2xl bg-surface p-4 shadow-card">
          <form className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
            <label className="space-y-2 text-sm font-medium">
              Search applications
              <input
                className="field"
                name="q"
                defaultValue={params.q}
                placeholder="Job title"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Pipeline stage
              <select
                className="field"
                name="status"
                defaultValue={params.status ?? "all"}
              >
                <option value="all">All stages</option>
                <option value="draft">Draft</option>
                <option value="ready_for_review">Pending approval</option>
                <option value="submitted">Submitted</option>
                <option value="viewed">Viewed</option>
                <option value="interviewing">Interviewing</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </label>
            <button className="button-secondary self-end" type="submit">
              Filter
            </button>
          </form>
        </section>
        {applications.length ? (
          <section className="space-y-4" aria-label="Application pipeline">
            {applications.map(
              (app: {
                id: string;
                status: ApplicationState;
                bid_amount: number | null;
                connects_cost: number | null;
                boost_connects: number;
                updated_at: string;
                jobs?: { title?: string } | null;
              }) => (
                <ApplicationCard application={app} key={app.id} />
              ),
            )}
          </section>
        ) : (
          <EmptyState
            icon={Send}
            title="No applications found"
            description="Prepare an application from a reviewed proposal. Nothing is submitted without exact-version approval."
            action={
              <Link className="button-secondary" href="/dashboard/proposals">
                View proposals
              </Link>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
