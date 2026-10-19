import type { CostEntry } from "./types";
export function summarizeCosts(entries: CostEntry[], monthlyBudget: number) {
  const bySource = entries.reduce<Record<string, number>>(
    (acc, entry) => ({
      ...acc,
      [entry.source]: (acc[entry.source] ?? 0) + entry.amountUsd,
    }),
    {},
  );
  const byModel = entries
    .filter((entry) => entry.model)
    .reduce<Record<string, number>>(
      (acc, entry) => ({
        ...acc,
        [entry.model!]: (acc[entry.model!] ?? 0) + entry.amountUsd,
      }),
      {},
    );
  const total = entries.reduce((sum, entry) => sum + entry.amountUsd, 0);
  return {
    total,
    confirmed: entries
      .filter((entry) => !entry.estimated)
      .reduce((sum, entry) => sum + entry.amountUsd, 0),
    estimated: entries
      .filter((entry) => entry.estimated)
      .reduce((sum, entry) => sum + entry.amountUsd, 0),
    bySource,
    byModel,
    budget: monthlyBudget,
    budgetPercent:
      monthlyBudget > 0
        ? Math.min(100, Math.round((total / monthlyBudget) * 1000) / 10)
        : null,
    overBudget: monthlyBudget >= 0 && total > monthlyBudget,
  };
}
