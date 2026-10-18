import type { NormalizedJob } from "@/core/jobs/types";

const competitionRank: Record<string, number> = {
  less_than_5: 0,
  "5_to_10": 1,
  "10_to_15": 2,
  "15_to_20": 3,
  "20_to_50": 4,
  "50_plus": 5,
  unknown: 6,
};

export function rankMonitoringCandidates(jobs: NormalizedJob[]) {
  return [...jobs].sort((a, b) => {
    const ageDifference = timestamp(b.publishedAt) - timestamp(a.publishedAt);
    if (ageDifference !== 0) return ageDifference;
    return (
      (competitionRank[a.proposalCount] ?? 6) -
      (competitionRank[b.proposalCount] ?? 6)
    );
  });
}

function timestamp(value: string | null) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
