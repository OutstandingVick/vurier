import type { FunnelPoint } from "./types";
const statusAtLeast = {
  submitted: [
    "submitted",
    "viewed",
    "interviewing",
    "offered",
    "won",
    "hired",
    "lost",
    "rejected",
    "withdrawn",
  ],
  viewed: ["viewed", "interviewing", "offered", "won", "hired"],
  interview: ["interviewing", "offered", "won", "hired"],
  hired: ["won", "hired"],
} as const;
export function buildFunnel(input: {
  discovered: number;
  qualified: number;
  proposals: number;
  statuses: string[];
  journeys?: string[][];
}): FunnelPoint[] {
  const journeys = input.journeys ?? input.statuses.map((status) => [status]);
  const reached = (stages: readonly string[]) =>
    journeys.filter((journey) => journey.some((status) => stages.includes(status))).length;
  const counts = [
    input.discovered,
    input.qualified,
    input.proposals,
    reached(statusAtLeast.submitted),
    reached(statusAtLeast.viewed),
    reached(statusAtLeast.interview),
    reached(statusAtLeast.hired),
  ];
  const stages = [
    ["discovered", "Jobs discovered"],
    ["qualified", "Qualified"],
    ["proposal", "Proposals"],
    ["submitted", "Submitted"],
    ["viewed", "Viewed"],
    ["interview", "Interviews"],
    ["hired", "Hired"],
  ] as const;
  return stages.map(([stage, label], index) => ({
    stage,
    label,
    count: counts[index],
    conversionFromPrior:
      index === 0 || counts[index - 1] === 0
        ? null
        : Math.round((counts[index] / counts[index - 1]) * 1000) / 10,
  }));
}
