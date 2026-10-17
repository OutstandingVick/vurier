import { PageShell } from "@/components/dashboard/page-shell";
export default function Loading() {
  return (
    <PageShell title="Applications" description="Loading application pipeline">
      <div
        className="h-64 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none"
        role="status"
        aria-label="Loading applications"
      />
    </PageShell>
  );
}
