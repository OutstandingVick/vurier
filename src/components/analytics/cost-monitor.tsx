export function CostMonitor({
  costs,
}: {
  costs: {
    total: number;
    confirmed: number;
    estimated: number;
    budget: number;
    budgetPercent: number | null;
    overBudget: boolean;
    byModel: Record<string, number>;
  };
}) {
  const currency = (value: number) => `$${value.toFixed(4)}`;
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">AI and research spend</h2>
          <p className="mt-1 text-sm text-muted">
            Provider usage estimates and recorded expenses.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${costs.overBudget ? "bg-danger/10 text-danger" : "bg-surface-muted text-muted"}`}
        >
          {costs.budgetPercent === null
            ? "Budget disabled"
            : `${costs.budgetPercent}% of budget`}
        </span>
      </div>
      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted"
        aria-label={
          costs.budgetPercent === null
            ? "No budget configured"
            : `${costs.budgetPercent}% of monthly budget used`
        }
      >
        <div
          className="h-full rounded-full bg-accent-strong"
          style={{ width: `${costs.budgetPercent ?? 0}%` }}
        />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted">Total</p>
          <p className="mt-1 font-semibold tabular-nums">
            {currency(costs.total)}
          </p>
        </div>
        <div>
          <p className="text-muted">Confirmed</p>
          <p className="mt-1 font-semibold tabular-nums">
            {currency(costs.confirmed)}
          </p>
        </div>
        <div>
          <p className="text-muted">Estimated</p>
          <p className="mt-1 font-semibold tabular-nums">
            {currency(costs.estimated)}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {Object.entries(costs.byModel).map(([model, value]) => (
          <div className="flex justify-between gap-3 text-sm" key={model}>
            <span className="text-muted">{model}</span>
            <span className="font-medium tabular-nums">{currency(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
