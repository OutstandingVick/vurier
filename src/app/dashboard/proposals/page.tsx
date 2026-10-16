import Link from "next/link";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function ProposalsPage() {
  let proposals: Array<Record<string, unknown>> = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      const { data } = await client
        .from("proposals")
        .select(
          "id,status,cover_letter,created_at,updated_at,qa_result,jobs(title)",
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      proposals = data ?? [];
    }
  }
  return (
    <PageShell
      title="Proposals"
      description="Strategies, drafts, and version history"
    >
      {proposals.length ? (
        <section className="grid gap-4" aria-label="Proposal drafts">
          {proposals.map((proposal) => {
            const job = proposal.jobs as { title?: string } | null;
            const qa = proposal.qa_result as { passed?: boolean } | null;
            return (
              <article
                className="rounded-2xl bg-surface p-5 shadow-card"
                key={String(proposal.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Draft · {qa?.passed ? "QA passed" : "Review flags"}
                    </span>
                    <h2 className="mt-1 text-lg font-semibold">
                      {job?.title ?? "Untitled opportunity"}
                    </h2>
                  </div>
                  <Link
                    className="button-secondary"
                    href={`/dashboard/proposals/${proposal.id}`}
                  >
                    Open editor
                  </Link>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                  {String(proposal.cover_letter)}
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          icon={FileText}
          title="No proposal drafts yet"
          description="Open an analyzed opportunity and create a strategy grounded in verified portfolio evidence."
          action={
            <Link className="button-secondary" href="/dashboard/opportunities">
              View opportunities
            </Link>
          }
        />
      )}
    </PageShell>
  );
}
