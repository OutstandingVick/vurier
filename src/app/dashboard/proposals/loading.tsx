import { PageShell } from "@/components/dashboard/page-shell";
export default function ProposalsLoading() {
  return (
    <PageShell title="Proposals" description="Loading proposal workspace">
      <div className="space-y-4" role="status" aria-label="Loading proposals">
        {[1, 2, 3].map((item) => (
          <div
            className="h-40 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none"
            key={item}
          />
        ))}
      </div>
    </PageShell>
  );
}
