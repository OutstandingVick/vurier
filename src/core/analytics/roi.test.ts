import { describe, expect, it } from "vitest";
import { calculateApplicationRoi } from "./roi";
const base = {
  id: "1",
  jobId: "j",
  createdAt: "2026-10-01",
  submittedAt: "2026-10-01",
  bidAmount: 100,
  connectsCost: 10,
  boostConnects: 2,
  earnings: 500,
  earningsConfirmed: true,
  timeInvestedMinutes: 90,
  timeConfirmed: true,
};
describe("application ROI", () => {
  it("separates confirmed earnings and converts connects explicitly", () => {
    const result = calculateApplicationRoi(
      [
        { ...base, status: "hired" },
        {
          ...base,
          id: "2",
          status: "submitted",
          earnings: 200,
          earningsConfirmed: false,
        },
      ],
      [
        {
          source: "deepseek",
          amountUsd: 1,
          estimated: true,
          occurredAt: "2026-10-01",
        },
      ],
      0.15,
    );
    expect(result).toMatchObject({
      connects: 24,
      confirmedEarnings: 500,
      estimatedEarnings: 200,
      timeHours: 3,
      costPerHire: 4.6,
    });
  });
  it("keeps no-interview costs unavailable", () =>
    expect(
      calculateApplicationRoi([{ ...base, status: "submitted" }], [], 0.15)
        .costPerInterview,
    ).toBeNull());
});
