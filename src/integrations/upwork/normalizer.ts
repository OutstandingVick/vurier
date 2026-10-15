import { detectMissingFields } from "@/core/jobs/missing-fields";
import type { ExperienceLevel, JobType, NormalizedJob, PaymentVerification, ProposalRange } from "@/core/jobs/types";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => typeof value === "object" && value !== null ? value as UnknownRecord : {};
const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : typeof value === "string" && value.trim() && Number.isFinite(Number(value)) ? Number(value) : null;
const strings = (value: unknown) => Array.isArray(value) ? value.map((item) => text(typeof item === "object" ? record(item).name : item)).filter((item): item is string => Boolean(item)) : [];

function proposalRange(value: unknown): ProposalRange {
  const normalized = text(value)?.toLowerCase().replaceAll(" ", "_");
  const values: ProposalRange[] = ["less_than_5", "5_to_10", "10_to_15", "15_to_20", "20_to_50", "50_plus"];
  return values.includes(normalized as ProposalRange) ? normalized as ProposalRange : "unknown";
}

export function normalizeUpworkJob(payload: UnknownRecord, retrievedAt = new Date()): NormalizedJob {
  const client = record(payload.client);
  const budget = record(payload.budget);
  const hourly = record(payload.hourly_rate ?? payload.hourlyRate);
  const typeText = text(payload.job_type ?? payload.type)?.toLowerCase();
  const jobType: JobType = typeText?.includes("hour") ? "hourly" : typeText?.includes("fixed") ? "fixed" : "unknown";
  const levelText = text(payload.experience_level ?? payload.experienceLevel)?.toLowerCase();
  const experienceLevel: ExperienceLevel = levelText?.includes("entry") ? "entry" : levelText?.includes("expert") ? "expert" : levelText?.includes("intermediate") ? "intermediate" : "unknown";
  const verifiedValue = client.payment_verified ?? client.paymentVerification;
  const clientPaymentVerification: PaymentVerification = verifiedValue === true ? "verified" : verifiedValue === false ? "unverified" : "unknown";
  const externalId = text(payload.id ?? payload.job_id ?? payload.ciphertext) ?? "";
  if (!externalId) throw new Error("Upwork job payload has no stable identifier.");
  const base: Omit<NormalizedJob, "missingFields"> = {
    source: "upwork_api", externalId, sourceUrl: text(payload.url ?? payload.job_url), title: text(payload.title) ?? "Untitled opportunity",
    description: text(payload.description) ?? "", category: text(payload.category), jobType,
    budgetMin: number(budget.min ?? payload.budget_min), budgetMax: number(budget.max ?? payload.budget_max),
    hourlyMin: number(hourly.min ?? payload.hourly_min), hourlyMax: number(hourly.max ?? payload.hourly_max), currency: text(budget.currency ?? payload.currency) ?? "USD",
    experienceLevel, skills: strings(payload.skills), clientCountry: text(client.country), clientPaymentVerification,
    clientRating: number(client.rating), clientSpend: number(client.total_spent ?? client.totalSpend), proposalCount: proposalRange(payload.proposals ?? payload.proposal_count),
    publishedAt: text(payload.published_at ?? payload.created_at), retrievedAt: retrievedAt.toISOString(), sourcePayload: payload,
  };
  return { ...base, missingFields: detectMissingFields(base) };
}
