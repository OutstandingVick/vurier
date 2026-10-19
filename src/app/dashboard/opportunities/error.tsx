"use client";
import { PageShell } from "@/components/dashboard/page-shell";
export default function OpportunitiesError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <PageShell
      title="Unable to load opportunities"
      description="The intelligence dashboard could not be loaded."
    >
      <div className="rounded-2xl bg-surface p-6 shadow-card">
        <p className="text-sm text-muted">
          Check your connection, then retry. Existing jobs and analyses are
          unchanged.
        </p>
        <button className="button-primary mt-4" onClick={() => retry()}>
          Retry loading
        </button>
      </div>
    </PageShell>
  );
}
