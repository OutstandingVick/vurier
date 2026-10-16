export function RecommendationLegend() {
  return (
    <aside
      className="rounded-2xl border bg-surface p-4 text-sm"
      aria-label="Recommendation thresholds"
    >
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <dt className="font-semibold">Apply</dt>
          <dd className="text-muted">80–100</dd>
        </div>
        <div>
          <dt className="font-semibold">Consider</dt>
          <dd className="text-muted">60–79</dd>
        </div>
        <div>
          <dt className="font-semibold">Skip</dt>
          <dd className="text-muted">0–59</dd>
        </div>
      </dl>
    </aside>
  );
}
