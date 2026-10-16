"use client";
import { PageShell } from "@/components/dashboard/page-shell";
export default function ProposalsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <PageShell
      title="Unable to load proposals"
      description="Drafts and versions remain saved."
    >
      <button className="button-primary" onClick={() => retry()}>
        Retry loading
      </button>
    </PageShell>
  );
}
