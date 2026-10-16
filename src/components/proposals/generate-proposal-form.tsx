"use client";
import { useActionState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { createProposal } from "@/app/dashboard/proposals/actions";
export function GenerateProposalForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(createProposal, {});
  return (
    <form
      action={action}
      className="rounded-2xl border border-accent-strong/30 bg-accent/10 p-5"
    >
      <input type="hidden" name="jobId" value={jobId} />
      <h2 className="font-semibold">Build proposal strategy</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        V4 Pro will plan the approach, then Flash will draft from verified
        portfolio evidence. Nothing is submitted.
      </p>
      {state.error ? (
        <p
          className="mt-3 rounded-xl bg-danger-soft p-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button className="button-primary mt-4" type="submit" disabled={pending}>
        {pending ? (
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Sparkles className="size-4" aria-hidden="true" />
        )}
        {pending ? "Building strategy…" : "Create proposal draft"}
      </button>
    </form>
  );
}
