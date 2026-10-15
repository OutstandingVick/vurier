import { describe, expect, it } from "vitest";
import { normalizeManualJob } from "@/core/jobs/manual-normalizer";
import { manualJobSchema } from "@/core/jobs/schema";

describe("manual job normalization", () => {
  it("uses canonical URLs for stable duplicate IDs", () => {
    const shared = { title: "Build a Next.js dashboard", description: "Build an accessible dashboard using Next.js and TypeScript for a fintech product.", jobType: "fixed" as const };
    const first = normalizeManualJob({ ...shared, sourceUrl: "https://www.upwork.com/jobs/~abc?ref=feed" });
    const second = normalizeManualJob({ ...shared, sourceUrl: "https://www.upwork.com/jobs/~abc/#details" });
    expect(first.externalId).toBe(second.externalId);
    expect(first.sourceUrl).toBe("https://www.upwork.com/jobs/~abc");
  });
  it("rejects non-Upwork URLs and malformed details", () => {
    expect(manualJobSchema.safeParse({ sourceUrl: "https://example.com/job", title: "No", description: "short", jobType: "unknown" }).success).toBe(false);
  });
  it("records unavailable provider fields", () => {
    const job = normalizeManualJob({ sourceUrl: "https://upwork.com/jobs/~abc", title: "Technical research writer", description: "Research and write a detailed technical report about modern payment infrastructure.", jobType: "unknown" });
    expect(job.missingFields).toContain("client_payment_verification");
    expect(job.sourcePayload).toEqual({ enteredByUser: true });
  });
});
