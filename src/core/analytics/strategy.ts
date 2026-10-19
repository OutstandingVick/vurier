import type { StrategyDimension } from "./types";
type Outcome = {
  dimension: string | null;
  status: string;
  earnings: number | null;
};
export function compareStrategies(
  rows: Outcome[],
  labels: Record<string, string> = {},
): StrategyDimension[] {
  const groups = new Map<string, Outcome[]>();
  for (const row of rows) {
    const key = row.dimension || "unavailable";
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()]
    .map(([key, values]) => {
      const interviews = values.filter((row) =>
        ["interviewing", "offered", "won", "hired"].includes(row.status),
      ).length;
      const hires = values.filter((row) =>
        ["won", "hired"].includes(row.status),
      ).length;
      return {
        key,
        label: labels[key] ?? (key === "unavailable" ? "Not recorded" : key),
        applications: values.length,
        interviews,
        hires,
        earnings: values.reduce((sum, row) => sum + (row.earnings ?? 0), 0),
        interviewRate: values.length ? interviews / values.length : 0,
        hireRate: values.length ? hires / values.length : 0,
        sampleSufficient: values.length >= 5,
      };
    })
    .sort((a, b) => b.hireRate - a.hireRate || b.applications - a.applications);
}
export function associationNote(sampleSufficient: boolean) {
  return sampleSufficient
    ? "Observed association; other factors may contribute."
    : "Directional only — fewer than 5 applications.";
}
