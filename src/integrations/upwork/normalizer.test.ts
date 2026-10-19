import { describe, expect, it } from "vitest";
import { normalizeUpworkJob } from "@/integrations/upwork/normalizer";

describe("Upwork normalizer", () => {
  it("normalizes an authorized provider payload", () => {
    const job = normalizeUpworkJob(
      {
        id: "job_123",
        title: "React engineer",
        description: "Build product UI",
        type: "hourly",
        hourly_rate: { min: 50, max: 80 },
        experience_level: "expert",
        skills: [{ name: "React" }, "TypeScript"],
        client: { payment_verified: true, country: "US", rating: 4.9 },
        proposals: "5_to_10",
      },
      new Date("2026-10-16T00:00:00Z"),
    );
    expect(job.externalId).toBe("job_123");
    expect(job.skills).toEqual(["React", "TypeScript"]);
    expect(job.clientPaymentVerification).toBe("verified");
    expect(job.missingFields).toContain("published_at");
  });
  it("rejects payloads without a stable provider ID", () => {
    expect(() => normalizeUpworkJob({ title: "Missing id" })).toThrow(
      "stable identifier",
    );
  });
});
