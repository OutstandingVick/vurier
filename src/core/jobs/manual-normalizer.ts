import { detectMissingFields } from "@/core/jobs/missing-fields";
import type { ManualJobInput } from "@/core/jobs/schema";
import type { NormalizedJob } from "@/core/jobs/types";
import { manualExternalId, normalizeUpworkJobUrl } from "@/core/jobs/url";

export function normalizeManualJob(
  input: ManualJobInput,
  now = new Date(),
): NormalizedJob {
  const sourceUrl = normalizeUpworkJobUrl(input.sourceUrl);
  const base: Omit<NormalizedJob, "missingFields"> = {
    source: "manual",
    externalId: manualExternalId(sourceUrl),
    sourceUrl,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category || null,
    jobType: input.jobType,
    budgetMin: input.budgetMin ?? null,
    budgetMax: input.budgetMax ?? null,
    hourlyMin: null,
    hourlyMax: null,
    currency: "USD",
    experienceLevel: "unknown",
    skills:
      input.skills
        ?.split(",")
        .map((skill) => skill.trim())
        .filter(Boolean) ?? [],
    clientCountry: null,
    clientPaymentVerification: "unknown",
    clientRating: null,
    clientSpend: null,
    proposalCount: "unknown",
    publishedAt: null,
    retrievedAt: now.toISOString(),
    sourcePayload: { enteredByUser: true },
  };
  return { ...base, missingFields: detectMissingFields(base) };
}
