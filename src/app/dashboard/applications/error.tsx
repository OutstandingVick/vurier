"use client";
import { PageShell } from "@/components/dashboard/page-shell";
export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <PageShell
      title="Unable to load applications"
      description="Saved packages and approvals are unchanged."
    >
      <button className="button-primary" onClick={() => retry()}>
        Retry loading
      </button>
    </PageShell>
  );
}
