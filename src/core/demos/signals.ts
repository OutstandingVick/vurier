import type { RoiFactors } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
export function deriveRoiSignals(input: {
  budgetMax: number | null;
  hourlyMax: number | null;
  proposalCount: string;
  paymentVerification: string;
  clientRating: number | null;
  publishedAt: string | null;
  minimumBudget: number | null;
  minimumHourly: number | null;
}): Omit<RoiFactors, "differentiation" | "effort"> {
  const budgetValue = input.budgetMax ?? input.hourlyMax;
  const preferred =
    input.budgetMax !== null ? input.minimumBudget : input.minimumHourly;
  const budget =
    budgetValue === null
      ? null
      : preferred && preferred > 0
        ? clamp((budgetValue / preferred) * 60)
        : 60;
  const competitionMap: Record<string, number | null> = {
    less_than_5: 95,
    "5_to_10": 85,
    "10_to_15": 70,
    "15_to_20": 60,
    "20_to_50": 40,
    "50_plus": 20,
    unknown: null,
  };
  const credibilitySignals = [
    input.paymentVerification === "verified"
      ? 85
      : input.paymentVerification === "unverified"
        ? 25
        : null,
    input.clientRating !== null ? clamp(input.clientRating * 20) : null,
  ].filter((value): value is number => value !== null);
  const credibility = credibilitySignals.length
    ? Math.round(
        credibilitySignals.reduce((sum, value) => sum + value, 0) /
          credibilitySignals.length,
      )
    : null;
  const ageHours = input.publishedAt
    ? (Date.now() - Date.parse(input.publishedAt)) / 3_600_000
    : null;
  const urgency =
    ageHours === null || Number.isNaN(ageHours)
      ? null
      : clamp(100 - ageHours * 4);
  return {
    budget,
    competition: competitionMap[input.proposalCount] ?? null,
    credibility,
    urgency,
  };
}
