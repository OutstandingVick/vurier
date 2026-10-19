"use client";
import { useActionState } from "react";
import {
  rebuildFeedbackAdjustments,
  rollbackAdjustment,
  type AnalyticsActionState,
} from "@/app/dashboard/analytics/actions";
const initial: AnalyticsActionState = {};
export function OptimizationPanel({
  enabled,
  adjustments,
}: {
  enabled: boolean;
  adjustments: Array<{
    id: string;
    factor: string;
    adjustment: number;
    sample_size: number;
    explanation: string;
  }>;
}) {
  const [state, action, pending] = useActionState(
    rebuildFeedbackAdjustments,
    initial,
  );
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <h2 className="font-semibold">Feedback optimization</h2>
      <p className="mt-1 text-sm text-muted">
        Optional, explainable category adjustments derived from recorded
        outcomes. No model fine-tuning.
      </p>
      <form
        action={action}
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
      >
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
          <input defaultChecked={enabled} name="enabled" type="checkbox" />
          Enable bounded outcome adjustments
        </label>
        <button className="button-secondary" disabled={pending} type="submit">
          {pending ? "Rebuilding…" : "Rebuild from outcomes"}
        </button>
      </form>
      {state.error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="mt-3 text-sm text-success" role="status">
          {state.message}
        </p>
      ) : null}
      <div className="mt-4 space-y-3">
        {adjustments.length ? (
          adjustments.map((item) => (
            <div
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface-muted p-4"
              key={item.id}
            >
              <div>
                <p className="text-sm font-semibold">
                  {item.factor.replace("category:", "Category: ")} ·{" "}
                  {item.adjustment > 0 ? "+" : ""}
                  {item.adjustment} points
                </p>
                <p className="mt-1 text-xs text-muted">{item.explanation}</p>
              </div>
              <form action={rollbackAdjustment}>
                <input type="hidden" name="adjustmentId" value={item.id} />
                <button className="button-ghost" type="submit">
                  Roll back
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">
            No active adjustments. At least three recorded outcomes are required
            per category.
          </p>
        )}
      </div>
    </section>
  );
}
