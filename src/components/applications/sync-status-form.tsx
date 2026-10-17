"use client";

import { useActionState } from "react";
import { syncApplicationStatus } from "@/app/dashboard/applications/actions";

export function SyncStatusForm({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState(syncApplicationStatus, {});
  return (
    <form action={action} className="rounded-2xl border bg-surface p-5">
      <h2 className="font-semibold">Authorized status sync</h2>
      <p className="mt-1 text-sm text-muted">
        Available only when Upwork granted proposal-status access.
      </p>
      <input type="hidden" name="applicationId" value={applicationId} />
      <button
        className="button-secondary mt-4"
        disabled={pending}
        type="submit"
      >
        {pending ? "Checking…" : "Check Upwork status"}
      </button>
      {state.error ? (
        <p className="mt-3 text-sm text-danger">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="mt-3 text-sm text-success">{state.message}</p>
      ) : null}
    </form>
  );
}
