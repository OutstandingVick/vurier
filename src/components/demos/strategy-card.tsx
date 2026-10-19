import Link from "next/link";
import { DecisionBadge } from "./decision-badge";
import type { DemoDecision } from "@/core/demos/types";
export function StrategyCard({
  strategy,
}: {
  strategy: Record<string, unknown>;
}) {
  const job = strategy.jobs as { title?: string } | null;
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {String(strategy.demo_kind).replaceAll("_", " ")}
          </p>
          <h2 className="mt-2 text-lg font-semibold">
            {job?.title ?? "Opportunity"}
          </h2>
        </div>
        <DecisionBadge decision={strategy.decision as DemoDecision} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
        {String(strategy.client_problem)}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="font-semibold tabular-nums">
            {String(strategy.roi_score)}/100
          </span>{" "}
          ROI
        </p>
        <Link
          className="button-secondary"
          href={`/dashboard/demos/${strategy.id}`}
        >
          Review workspace
        </Link>
      </div>
    </article>
  );
}
