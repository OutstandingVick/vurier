export const JOB_CATEGORIES = [
  "Frontend Development",
  "React & Next.js",
  "Web3",
  "Fintech",
  "Technical Writing",
  "Research",
  "Other",
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];
export type JobType = "hourly" | "fixed" | "unknown";
export type ExperienceLevel = "entry" | "intermediate" | "expert" | "unknown";
export type PaymentVerification = "verified" | "unverified" | "unknown";
export type ProposalRange =
  | "less_than_5"
  | "5_to_10"
  | "10_to_15"
  | "15_to_20"
  | "20_to_50"
  | "50_plus"
  | "unknown";
export type JobSourceKind = "upwork_api" | "manual";

export type MissingJobField =
  | "budget"
  | "hourly_rate"
  | "experience_level"
  | "client_payment_verification"
  | "client_rating"
  | "client_spend"
  | "proposal_count"
  | "published_at"
  | "skills";

export type NormalizedJob = {
  source: JobSourceKind;
  externalId: string;
  sourceUrl: string | null;
  title: string;
  description: string;
  category: string | null;
  jobType: JobType;
  budgetMin: number | null;
  budgetMax: number | null;
  hourlyMin: number | null;
  hourlyMax: number | null;
  currency: string;
  experienceLevel: ExperienceLevel;
  skills: string[];
  clientCountry: string | null;
  clientPaymentVerification: PaymentVerification;
  clientRating: number | null;
  clientSpend: number | null;
  proposalCount: ProposalRange;
  publishedAt: string | null;
  retrievedAt: string;
  missingFields: MissingJobField[];
  sourcePayload: Record<string, unknown>;
};

export type JobSearchFilters = {
  query?: string;
  category?: string;
  jobType?: JobType | "all";
  experienceLevel?: ExperienceLevel | "all";
  paymentVerified?: "all" | "verified" | "unverified";
  proposalCount?: ProposalRange | "all";
  minimumBudget?: number;
  maximumAgeHours?: number;
  sort?: "newest" | "budget_high" | "competition_low";
  page?: number;
  pageSize?: number;
};
