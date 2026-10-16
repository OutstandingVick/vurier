export function UsageSummary({
  analyses,
  estimatedCostUsd,
}: {
  analyses: number;
  estimatedCostUsd: number;
}) {
  return (
    <aside
      className="rounded-2xl border bg-surface p-4"
      aria-label="Visible analysis usage"
    >
      <p className="text-sm font-semibold">Analysis usage</p>
      <p className="mt-1 text-sm text-muted">
        {analyses} cached result{analyses === 1 ? "" : "s"} · $
        {estimatedCostUsd.toFixed(4)} estimated provider cost
      </p>
    </aside>
  );
}
