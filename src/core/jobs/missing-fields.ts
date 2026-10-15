import type { MissingJobField, NormalizedJob } from "@/core/jobs/types";

export function detectMissingFields(job: Omit<NormalizedJob, "missingFields">): MissingJobField[] {
  const missing: MissingJobField[] = [];
  if (job.budgetMin === null && job.budgetMax === null) missing.push("budget");
  if (job.hourlyMin === null && job.hourlyMax === null) missing.push("hourly_rate");
  if (job.experienceLevel === "unknown") missing.push("experience_level");
  if (job.clientPaymentVerification === "unknown") missing.push("client_payment_verification");
  if (job.clientRating === null) missing.push("client_rating");
  if (job.clientSpend === null) missing.push("client_spend");
  if (job.proposalCount === "unknown") missing.push("proposal_count");
  if (job.publishedAt === null) missing.push("published_at");
  if (job.skills.length === 0) missing.push("skills");
  return missing;
}
