import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { MetricValue } from "@/core/analytics";
export function MetricCard({
  label,
  metric,
  format = (value) => value.toLocaleString(),
}: {
  label: string;
  metric: MetricValue;
  format?: (value: number) => string;
}) {
  const direction = metric.value - metric.previous;
  const Icon =
    direction > 0 ? ArrowUpRight : direction < 0 ? ArrowDownRight : Minus;
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
        {format(metric.value)}
      </p>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted">
        <Icon className="size-3.5" aria-hidden="true" />
        {metric.changePercent === null
          ? "No prior baseline"
          : `${Math.abs(metric.changePercent)}% ${direction === 0 ? "unchanged" : direction > 0 ? "higher" : "lower"}`}
        <span className="sr-only"> compared with previous period</span>
      </p>
    </article>
  );
}
