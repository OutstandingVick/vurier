import {
  Activity,
  BellRing,
  Search,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export function ActivitySummary({
  totals,
}: {
  totals: {
    runs: number;
    discovered: number;
    analyzed: number;
    delivered: number;
    failures: number;
  };
}) {
  const items = [
    { label: "Runs", value: totals.runs, icon: Activity },
    { label: "Jobs discovered", value: totals.discovered, icon: Search },
    { label: "Analyzed", value: totals.analyzed, icon: Sparkles },
    { label: "Alerts delivered", value: totals.delivered, icon: BellRing },
    { label: "Failures", value: totals.failures, icon: TriangleAlert },
  ];
  return (
    <section
      className="grid grid-cols-2 gap-3 xl:grid-cols-5"
      aria-label="Monitoring totals"
    >
      {items.map(({ label, value, icon: Icon }) => (
        <article key={label} className="rounded-2xl bg-surface p-4 shadow-card">
          <Icon className="size-5 text-muted" aria-hidden="true" />
          <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </article>
      ))}
    </section>
  );
}
