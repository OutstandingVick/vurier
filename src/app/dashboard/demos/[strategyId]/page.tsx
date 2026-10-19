import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { DecisionBadge } from "@/components/demos/decision-badge";
import { RoiBreakdown } from "@/components/demos/roi-breakdown";
import { DemoEditor } from "@/components/demos/demo-editor";
import { ReferencePanel } from "@/components/demos/reference-panel";
import { AssetPanel } from "@/components/demos/asset-panel";
import { EvidenceList } from "@/components/demos/evidence-list";
import { BriefView } from "@/components/demos/brief-view";
import { StrategyReasoning } from "@/components/demos/strategy-reasoning";
import { rankPortfolioEvidence } from "@/core/demos/evidence-ranker";
import type {
  DemoBrief,
  DemoDecision,
  DemoKind,
  RoiFactors,
} from "@/core/demos/types";
import type { PortfolioEvidence, PortfolioKind } from "@/core/proposals/types";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function DemoDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string }>;
}) {
  const { strategyId } = await params;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) notFound();
  const [{ data: strategy }, { data: references }, { data: assets }] =
    await Promise.all([
      client
        .from("demo_strategies")
        .select("*,jobs(*)")
        .eq("id", strategyId)
        .eq("user_id", user.id)
        .maybeSingle(),
      client
        .from("demo_references")
        .select("*")
        .eq("strategy_id", strategyId)
        .eq("user_id", user.id)
        .order("created_at"),
      client
        .from("demo_assets")
        .select("*")
        .eq("strategy_id", strategyId)
        .eq("user_id", user.id)
        .order("created_at"),
    ]);
  if (!strategy) notFound();
  const { data: rawEvidence } = await client
    .from("portfolio_items")
    .select(
      "id,title,description,kind,skills,achievements,project_url,repository_url,file_path,verified",
    )
    .eq("user_id", user.id)
    .in("id", strategy.selected_evidence_ids ?? []);
  const evidence = (rawEvidence ?? []).map((item): PortfolioEvidence => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    kind: item.kind as PortfolioKind,
    skills: item.skills ?? [],
    achievements: item.achievements ?? [],
    projectUrl: item.project_url,
    repositoryUrl: item.repository_url,
    filePath: item.file_path,
    verified: item.verified,
  }));
  const ranked = rankPortfolioEvidence(
    `${strategy.jobs.title} ${strategy.jobs.description} ${(strategy.jobs.skills ?? []).join(" ")}`,
    evidence,
    strategy.demo_kind as DemoKind,
  );
  return (
    <PageShell
      title={strategy.jobs.title}
      description="Proof-of-work recommendation and editable workspace"
    >
      <div className="space-y-6">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted"
          href="/dashboard/demos"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to demo intelligence
        </Link>
        <section className="rounded-2xl bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {String(strategy.demo_kind).replaceAll("_", " ")}
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {strategy.client_problem}
              </h2>
            </div>
            <DecisionBadge decision={strategy.decision as DemoDecision} />
          </div>
          <div className="mt-5 flex flex-wrap gap-6 text-sm">
            <p>
              <span className="font-semibold tabular-nums">
                {strategy.roi_score}/100
              </span>{" "}
              ROI score
            </p>
            <p>
              <span className="font-semibold tabular-nums">
                {strategy.roi_confidence}%
              </span>{" "}
              confidence
            </p>
            <p>
              <span className="font-semibold">
                ${Number(strategy.estimated_cost_usd).toFixed(4)}
              </span>{" "}
              estimated AI cost
            </p>
          </div>
        </section>
        <StrategyReasoning
          rationale={strategy.rationale ?? []}
          risks={strategy.risks ?? []}
        />
        <RoiBreakdown factors={strategy.roi_factors as RoiFactors} />
        <EvidenceList evidence={ranked} />
        <BriefView brief={strategy.brief as DemoBrief} />
        <DemoEditor
          strategyId={strategy.id}
          brief={strategy.brief}
          prompt={strategy.implementation_prompt}
        />
        <div className="grid gap-6 xl:grid-cols-2">
          <ReferencePanel
            strategyId={strategy.id}
            references={references ?? []}
          />
          <AssetPanel strategyId={strategy.id} assets={assets ?? []} />
        </div>
      </div>
    </PageShell>
  );
}
