import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { ProposalEditor } from "@/components/proposals/proposal-editor";
import { PrepareApplicationForm } from "@/components/applications/prepare-application-form";
import { ProposalSummary } from "@/components/proposals/proposal-summary";
import { QualityReport } from "@/components/proposals/quality-report";
import { StrategyView } from "@/components/proposals/strategy-view";
import { VersionHistory } from "@/components/proposals/version-history";
import type { ProposalStrategy, QaResult } from "@/core/proposals/types";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) notFound();
  const [{ data: proposal }, { data: versions }] = await Promise.all([
    client
      .from("proposals")
      .select(
        "*,jobs(title),proposal_strategies(strategy,selected_evidence_ids)",
      )
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .maybeSingle(),
    client
      .from("proposal_versions")
      .select("id,version_number,source,tone,length,created_at")
      .eq("proposal_id", proposalId)
      .eq("user_id", user.id)
      .order("version_number", { ascending: false }),
  ]);
  if (!proposal) notFound();
  const strategy = proposal.proposal_strategies?.strategy as ProposalStrategy;
  return (
    <PageShell
      title={proposal.jobs?.title ?? "Proposal draft"}
      description="Strategy, writing, and quality review"
    >
      <div className="space-y-6">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted"
          href="/dashboard/proposals"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to proposals
        </Link>
        <section className="rounded-2xl border border-accent-strong/30 bg-accent/10 p-5">
          <h2 className="font-semibold">Draft only — not submitted</h2>
          <p className="mt-1 text-sm text-muted">
            Vurier cannot submit this proposal or spend Connects. Review every
            fact and estimate before any manual application.
          </p>
        </section>
        <StrategyView strategy={strategy} />
        <ProposalSummary
          strategy={strategy}
          attachmentCount={proposal.attachment_ids?.length ?? 0}
        />
        <ProposalEditor
          proposalId={proposal.id}
          initialText={proposal.cover_letter}
        />
        <QualityReport qa={proposal.qa_result as QaResult} />
        <section className="rounded-2xl border bg-surface p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Paperclip className="size-4" aria-hidden="true" />
            Application details
          </h2>
          <p className="mt-2 text-sm text-muted">
            Suggested bid and timeline are estimates. Attachments are selected
            only from verified portfolio evidence.
          </p>
          <p className="mt-3 text-sm">
            {proposal.attachment_ids?.length ?? 0} suggested attachment(s) ·{" "}
            {proposal.milestones?.length ?? 0} milestone(s) ·{" "}
            {proposal.screening_answers?.length ?? 0} screening answer(s)
          </p>
        </section>
        <VersionHistory versions={versions ?? []} />
        <PrepareApplicationForm proposalId={proposal.id} />
      </div>
    </PageShell>
  );
}
