import type {
  MatchingProfile,
  OpportunityInput,
} from "@/core/opportunities/types";

export function mapJobRow(row: Record<string, unknown>): OpportunityInput {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    category: row.category as string | null,
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    budgetMin: numberOrNull(row.budget_min),
    budgetMax: numberOrNull(row.budget_max),
    hourlyMin: numberOrNull(row.hourly_min),
    hourlyMax: numberOrNull(row.hourly_max),
    proposalCount: String(row.proposal_count ?? "unknown"),
    clientPaymentVerification: String(
      row.client_payment_verification ?? "unknown",
    ),
    clientRating: numberOrNull(row.client_rating),
    clientSpend: numberOrNull(row.client_spend),
    publishedAt: row.published_at as string | null,
  };
}
export function mapMatchingProfile(
  profile: Record<string, unknown> | null,
  settings: Record<string, unknown> | null,
  portfolio: Record<string, unknown>[],
): MatchingProfile {
  return {
    verifiedSkills: Array.isArray(profile?.verified_skills)
      ? (profile.verified_skills as string[])
      : [],
    experienceSummary: String(profile?.bio ?? ""),
    portfolio: portfolio.map((item) => ({
      title: String(item.title),
      description: String(item.description ?? ""),
      skills: Array.isArray(item.skills) ? (item.skills as string[]) : [],
    })),
    preferredCategories: Array.isArray(settings?.preferred_categories)
      ? (settings.preferred_categories as string[])
      : [],
    minimumFixedBudget: numberOrNull(settings?.minimum_fixed_budget),
    minimumHourlyRate: numberOrNull(settings?.minimum_hourly_rate),
  };
}
function numberOrNull(value: unknown) {
  return typeof value === "number"
    ? value
    : typeof value === "string" && value !== ""
      ? Number(value)
      : null;
}
