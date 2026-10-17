import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ApplicationState } from "@/core/applications/types";
import { ApplicationStatusBadge } from "@/components/applications/status-badge";
export function ApplicationCard({
  application,
}: {
  application: {
    id: string;
    status: ApplicationState;
    bid_amount: number | null;
    connects_cost: number | null;
    boost_connects: number;
    updated_at: string;
    jobs?: { title?: string } | null;
  };
}) {
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ApplicationStatusBadge status={application.status} />
          <h2 className="mt-2 text-lg font-semibold">
            {application.jobs?.title ?? "Untitled opportunity"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Bid{" "}
            {application.bid_amount === null
              ? "unavailable"
              : `$${application.bid_amount.toLocaleString()}`}{" "}
            · {application.connects_cost ?? "?"} Connects +{" "}
            {application.boost_connects} boost
          </p>
        </div>
        <Link
          className="button-secondary"
          href={`/dashboard/applications/${application.id}`}
        >
          View application <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
