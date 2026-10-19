"use client";
import { useActionState } from "react";
import {
  saveApplicationOutcome,
  type AnalyticsActionState,
} from "@/app/dashboard/analytics/actions";
const initial: AnalyticsActionState = {};
export function OutcomeForm({
  application,
}: {
  application: {
    id: string;
    earnings?: number | null;
    earnings_confirmed?: boolean;
    time_invested_minutes?: number | null;
    time_confirmed?: boolean;
    outcome_note?: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    saveApplicationOutcome,
    initial,
  );
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="font-semibold">Outcome and ROI details</h2>
      <p className="mt-1 text-sm text-muted">
        Record actual results when known. Estimates remain visibly separate in
        analytics.
      </p>
      <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="applicationId" value={application.id} />
        <label className="space-y-2 text-sm font-medium">
          Earnings (USD)
          <input
            className="field"
            defaultValue={application.earnings ?? ""}
            min="0"
            max="100000000"
            name="earnings"
            step="0.01"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Time invested (minutes)
          <input
            className="field"
            defaultValue={application.time_invested_minutes ?? ""}
            min="0"
            max="100000"
            name="timeMinutes"
            step="1"
            type="number"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            defaultChecked={application.earnings_confirmed}
            name="earningsConfirmed"
            type="checkbox"
          />
          Earnings are confirmed
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            defaultChecked={application.time_confirmed}
            name="timeConfirmed"
            type="checkbox"
          />
          Time is confirmed
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Outcome note
          <textarea
            className="field min-h-24"
            defaultValue={application.outcome_note ?? ""}
            maxLength={1000}
            name="note"
          />
        </label>
        {state.error ? (
          <p className="text-sm text-danger sm:col-span-2" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-success sm:col-span-2" role="status">
            {state.message}
          </p>
        ) : null}
        <button
          className="button-secondary sm:col-span-2"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving…" : "Save outcome details"}
        </button>
      </form>
    </section>
  );
}
