import { PageShell } from "@/components/dashboard/page-shell";
export default function AnalyticsLoading() {
  return (
    <PageShell title="Analytics" description="Loading recorded performance">
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Loading analytics"
      >
        <div className="h-28 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-36 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none"
              key={index}
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none" />
      </div>
    </PageShell>
  );
}
