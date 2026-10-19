"use client";
import { PageShell } from "@/components/dashboard/page-shell";
export default function AnalyticsError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageShell
      title="Analytics"
      description="Performance data is temporarily unavailable"
    >
      <section className="rounded-2xl border bg-surface p-6">
        <h2 className="font-semibold">Analytics could not load</h2>
        <p className="mt-2 text-sm text-muted">
          Your stored records were not changed. Retry the read, or check
          Supabase connectivity if this continues.
        </p>
        <button className="button-secondary mt-4" onClick={reset} type="button">
          Retry analytics
        </button>
      </section>
    </PageShell>
  );
}
