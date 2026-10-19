function money(value: number | null) {
  return value === null
    ? "Not available"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);
}
export function RoiPanel({ roi }: { roi: Record<string, number | null> }) {
  const rows = [
    ["Connects used", roi.connects?.toLocaleString() ?? "0"],
    ["Estimated Connects cost", money(roi.connectsCostUsd)],
    ["AI and research cost", money(roi.aiAndResearch)],
    ["Time invested", `${roi.timeHours ?? 0} hours`],
    ["Cost per interview", money(roi.costPerInterview)],
    ["Cost per hire", money(roi.costPerHire)],
    [
      "Confirmed earnings / Connect",
      roi.earningsPerConnect === null
        ? "Not available"
        : money(roi.earningsPerConnect),
    ],
  ];
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <h2 className="font-semibold">Application ROI</h2>
      <p className="mt-1 text-sm text-muted">
        Optimize contracts won per Connect spent.
      </p>
      <dl className="mt-5 divide-y">
        {rows.map(([label, value]) => (
          <div
            className="flex items-center justify-between gap-4 py-3"
            key={label}
          >
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl bg-surface-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Confirmed net return
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {money(roi.netConfirmed)}
        </p>
        <p className="mt-1 text-xs text-muted">
          Confirmed earnings only, less estimated application costs.
        </p>
      </div>
    </section>
  );
}
