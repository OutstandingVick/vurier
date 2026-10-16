"use client";
import { useActionState } from "react";
import { BrainCircuit, LoaderCircle } from "lucide-react";
import { analyzeJobs } from "@/app/dashboard/opportunities/actions";

export function AnalysisBatchForm({
  jobs,
  disabledReason,
}: {
  jobs: Array<{ id: string; title: string; analyzed: boolean }>;
  disabledReason?: string;
}) {
  const [state, action, pending] = useActionState(analyzeJobs, {});
  return (
    <form
      action={action}
      className="rounded-2xl bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Batch analysis
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Select up to 25 jobs. Flash screens every job; V4 Pro runs only for
            promising results.
          </p>
        </div>
        <button
          className="button-primary w-full shrink-0 2xl:w-auto"
          type="submit"
          disabled={pending || Boolean(disabledReason)}
        >
          {pending ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <BrainCircuit className="size-4" aria-hidden="true" />
          )}
          {pending ? "Analyzing…" : "Analyze selected"}
        </button>
      </div>
      {disabledReason ? (
        <p className="mt-4 rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">
          {disabledReason}
        </p>
      ) : null}
      <fieldset className="mt-5 grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Select opportunities</legend>
        {jobs.map((job) => (
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm"
            key={job.id}
          >
            <input
              className="size-4 accent-[var(--accent-strong)]"
              type="checkbox"
              name="jobIds"
              value={job.id}
            />{" "}
            <span className="min-w-0 flex-1 truncate">{job.title}</span>
            {job.analyzed ? (
              <span className="text-xs text-muted">Cached</span>
            ) : null}
          </label>
        ))}
      </fieldset>
      {state.error ? (
        <p
          className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p
          className="mt-4 rounded-xl bg-accent/20 px-4 py-3 text-sm"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
