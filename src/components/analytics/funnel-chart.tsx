import type { FunnelPoint } from "@/core/analytics";
export function FunnelChart({ points }: { points: FunnelPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.count));
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div>
        <h2 className="font-semibold">Conversion funnel</h2>
        <p className="mt-1 text-sm text-muted">
          Recorded progression through the application lifecycle.
        </p>
      </div>
      <ol className="mt-6 space-y-4">
        {points.map((point) => (
          <li
            className="grid gap-2 sm:grid-cols-[8rem_1fr_8rem] sm:items-center"
            key={point.stage}
          >
            <div>
              <p className="text-sm font-medium">{point.label}</p>
              <p className="text-xs text-muted">
                {point.conversionFromPrior === null
                  ? "Baseline"
                  : `${point.conversionFromPrior}% from prior`}
              </p>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-surface-muted"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-accent-strong"
                style={{
                  width: `${Math.max(point.count ? 4 : 0, (point.count / max) * 100)}%`,
                }}
              />
            </div>
            <p className="text-end text-xl font-semibold tabular-nums">
              {point.count}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
