"use client";
import { useActionState } from "react";
import Link from "next/link";
import { generateProofOfWork } from "@/app/dashboard/demos/actions";
export function GenerateDemoForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(generateProofOfWork, {});
  return (
    <form action={action} className="rounded-2xl border bg-surface p-5">
      <h2 className="font-semibold">Proof-of-work intelligence</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        V4 Pro evaluates whether custom work is worth the effort. Nothing is
        built, deployed, or attached automatically.
      </p>
      <input type="hidden" name="jobId" value={jobId} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="button-primary" type="submit" disabled={pending}>
          {pending ? "Evaluating…" : "Generate strategy"}
        </button>
        {state.strategyId ? (
          <Link
            className="button-secondary"
            href={`/dashboard/demos/${state.strategyId}`}
          >
            Review strategy
          </Link>
        ) : null}
      </div>
      <div className="mt-3" role="status" aria-live="polite">
        {state.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-success">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
