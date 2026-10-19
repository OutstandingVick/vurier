import type { ApplicationAnalyticsRow, CostEntry } from "./types";
export function calculateApplicationRoi(
  applications: ApplicationAnalyticsRow[],
  costs: CostEntry[],
  connectsUsdRate: number,
) {
  const interviews = applications.filter((row) =>
    ["interviewing", "offered", "won", "hired"].includes(row.status),
  ).length;
  const hires = applications.filter((row) =>
    ["won", "hired"].includes(row.status),
  ).length;
  const connects = applications.reduce(
    (sum, row) => sum + (row.connectsCost ?? 0) + row.boostConnects,
    0,
  );
  const connectsCostUsd = connects * connectsUsdRate;
  const aiAndResearch = costs.reduce((sum, cost) => sum + cost.amountUsd, 0);
  const totalCostUsd = connectsCostUsd + aiAndResearch;
  const confirmedEarnings = applications
    .filter((row) => row.earningsConfirmed)
    .reduce((sum, row) => sum + (row.earnings ?? 0), 0);
  const estimatedEarnings = applications
    .filter((row) => !row.earningsConfirmed)
    .reduce((sum, row) => sum + (row.earnings ?? 0), 0);
  const minutes = applications.reduce(
    (sum, row) => sum + (row.timeInvestedMinutes ?? 0),
    0,
  );
  return {
    connects,
    connectsCostUsd,
    aiAndResearch,
    totalCostUsd,
    confirmedEarnings,
    estimatedEarnings,
    timeHours: Math.round((minutes / 60) * 10) / 10,
    costPerInterview: interviews ? totalCostUsd / interviews : null,
    costPerHire: hires ? totalCostUsd / hires : null,
    earningsPerConnect: connects ? confirmedEarnings / connects : null,
    netConfirmed: confirmedEarnings - totalCostUsd,
  };
}
