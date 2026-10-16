import { XCircle } from "lucide-react";
import { cancelAnalysis } from "@/app/dashboard/opportunities/actions";
import { batchProgress } from "@/core/opportunities/batch-progress";

export function BatchStatus({
  run,
}: {
  run: {
    id: string;
    metadata: { total?: number; completed?: number; failed?: number } | null;
  };
}) {
  const total = run.metadata?.total ?? 0;
  const completed = run.metadata?.completed ?? 0;
  const failed = run.metadata?.failed ?? 0;
  const progress = batchProgress(total, completed, failed);
  return (
    <section
      className="rounded-2xl border bg-surface p-5"
      aria-labelledby="batch-status-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="batch-status-heading" className="font-semibold">
            Analysis in progress
          </h2>
          <p className="mt-1 text-sm text-muted" role="status">
            {completed + failed} of {total} processed · {failed} failed
          </p>
        </div>
        <form action={cancelAnalysis}>
          <input type="hidden" name="runId" value={run.id} />
          <button className="button-secondary" type="submit">
            <XCircle className="size-4" aria-hidden="true" />
            Cancel batch
          </button>
        </form>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-accent-strong"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
