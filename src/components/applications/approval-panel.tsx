"use client";
import { useActionState } from "react";
import { ShieldCheck, Send } from "lucide-react";
import {
  approveApplication,
  submitApplication,
} from "@/app/dashboard/applications/actions";
export function ApprovalPanel({
  application,
}: {
  application: {
    id: string;
    status: string;
    bid_amount: number | null;
    connects_cost: number | null;
    boost_connects: number;
  };
}) {
  const [approveState, approveAction, approving] = useActionState(
    approveApplication,
    {},
  );
  const [submitState, submitAction, submitting] = useActionState(
    submitApplication,
    {},
  );
  if (application.status === "ready_for_review")
    return (
      <form
        action={approveAction}
        className="rounded-2xl border border-accent-strong/30 bg-accent/10 p-5"
      >
        <input type="hidden" name="applicationId" value={application.id} />
        <h2 className="font-semibold">Explicit approval required</h2>
        <p className="mt-2 text-sm leading-6">
          Final bid:{" "}
          <strong>
            {application.bid_amount === null
              ? "Unavailable"
              : `$${application.bid_amount.toLocaleString()}`}
          </strong>
          <br />
          Application cost:{" "}
          <strong>{application.connects_cost ?? "Unavailable"} Connects</strong>
          <br />
          Boost: <strong>{application.boost_connects} Connects</strong>
        </p>
        <label className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border bg-surface px-3 text-sm">
          <input type="checkbox" name="confirm" value="yes" required />I approve
          this exact version, bid, application cost, and boost.
        </label>
        {approveState.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {approveState.error}
          </p>
        ) : null}
        <button
          className="button-primary mt-4"
          disabled={approving}
          type="submit"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          {approving ? "Approving…" : "Approve for submission"}
        </button>
      </form>
    );
  if (application.status === "approved")
    return (
      <form action={submitAction} className="rounded-2xl border bg-surface p-5">
        <input type="hidden" name="applicationId" value={application.id} />
        <h2 className="font-semibold">Final submission action</h2>
        <p className="mt-2 text-sm text-muted">
          Approval expires after 15 minutes. If authorized submission is
          unavailable, Vurier will show the manual fallback and will not
          simulate success.
        </p>
        {submitState.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {submitState.error}
          </p>
        ) : null}
        {submitState.message ? (
          <p className="mt-3 text-sm" role="status">
            {submitState.message}
          </p>
        ) : null}
        <button
          className="button-primary mt-4"
          disabled={submitting}
          type="submit"
        >
          <Send className="size-4" aria-hidden="true" />
          {submitting ? "Submitting…" : "Submit now"}
        </button>
      </form>
    );
  return null;
}
