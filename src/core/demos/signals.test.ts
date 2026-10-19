import { describe, expect, it, vi } from "vitest";
import { deriveRoiSignals } from "./signals";

describe("ROI signals", () => {
  it("maps known competition and credibility without fabrication", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T12:00:00Z"));
    const result = deriveRoiSignals({
      budgetMax: 2_000,
      hourlyMax: null,
      proposalCount: "less_than_5",
      paymentVerification: "verified",
      clientRating: 4.5,
      publishedAt: "2026-10-19T10:00:00Z",
      minimumBudget: 1_000,
      minimumHourly: null,
    });
    expect(result).toMatchObject({
      budget: 100,
      competition: 95,
      credibility: 88,
      urgency: 92,
    });
    vi.useRealTimers();
  });
  it("preserves unavailable client and timing signals", () =>
    expect(
      deriveRoiSignals({
        budgetMax: null,
        hourlyMax: null,
        proposalCount: "unknown",
        paymentVerification: "unknown",
        clientRating: null,
        publishedAt: null,
        minimumBudget: null,
        minimumHourly: null,
      }),
    ).toEqual({
      budget: null,
      competition: null,
      credibility: null,
      urgency: null,
    }));
});
