"use client";
import { DiscoveryError } from "@/components/jobs/discovery-status";
import { PageShell } from "@/components/dashboard/page-shell";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageShell title="Discover jobs">
      <DiscoveryError message="The job feed could not be loaded." />
      <button className="button-secondary mt-4" type="button" onClick={reset}>
        Try again
      </button>
    </PageShell>
  );
}
