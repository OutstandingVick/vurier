"use client";
import { useActionState } from "react";
import {
  reconcileUncertainSubmission,
  type ApplicationActionState,
} from "@/app/dashboard/applications/actions";
const initial: ApplicationActionState = {};
export function ReconciliationPanel({
  applicationId,
}: {
  applicationId: string;
}) {
  const [state, action, pending] = useActionState(
    reconcileUncertainSubmission,
    initial,
  );
  return (
    <section className="rounded-2xl border border-danger/30 bg-danger-soft p-5">
      <h2 className="font-semibold">Submission outcome needs reconciliation</h2>
      <p className="mt-1 text-sm text-muted">
        Check Upwork directly. Vurier will not retry an uncertain submission
        automatically.
      </p>
      <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="applicationId" value={applicationId} />
        <label className="space-y-2 text-sm font-medium">
          Verified outcome
          <select className="field" name="outcome">
            <option value="submitted">Submitted on Upwork</option>
            <option value="not_submitted">Not submitted</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Upwork proposal ID{" "}
          <span className="font-normal text-muted">
            (required if submitted)
          </span>
          <input className="field" maxLength={200} name="externalId" />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
          <input required name="confirm" type="checkbox" value="yes" />I
          verified this outcome directly in Upwork
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
          {pending ? "Reconciling…" : "Reconcile verified outcome"}
        </button>
      </form>
    </section>
  );
}
