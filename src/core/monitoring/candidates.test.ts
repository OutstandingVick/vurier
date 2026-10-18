import { describe, expect, it } from "vitest";
import { rankMonitoringCandidates } from "./candidates";
import type { NormalizedJob } from "@/core/jobs/types";

function job(
  externalId: string,
  publishedAt: string | null,
  proposalCount: NormalizedJob["proposalCount"],
): NormalizedJob {
  return {
    source: "upwork_api",
    externalId,
    sourceUrl: null,
    title: externalId,
    description: "description",
    category: null,
    jobType: "unknown",
    budgetMin: null,
    budgetMax: null,
    hourlyMin: null,
    hourlyMax: null,
    currency: "USD",
    experienceLevel: "unknown",
    skills: [],
    clientCountry: null,
    clientPaymentVerification: "unknown",
    clientRating: null,
    clientSpend: null,
    proposalCount,
    publishedAt,
    retrievedAt: new Date(0).toISOString(),
    missingFields: [],
    sourcePayload: {},
  };
}

describe("monitoring candidate ranking", () => {
  it("prioritizes newer jobs then lower competition", () => {
    const ranked = rankMonitoringCandidates([
      job("old", "2026-10-17T00:00:00Z", "less_than_5"),
      job("busy", "2026-10-18T00:00:00Z", "50_plus"),
      job("quiet", "2026-10-18T00:00:00Z", "less_than_5"),
    ]);
    expect(ranked.map((item) => item.externalId)).toEqual([
      "quiet",
      "busy",
      "old",
    ]);
  });
});
