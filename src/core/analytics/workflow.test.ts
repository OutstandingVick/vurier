import { describe, expect, it } from "vitest";
import { buildFunnel } from "./funnel";
import { calculateApplicationRoi } from "./roi";
import { boundedAdjustments } from "./optimization";
describe("analytics optimization workflow", () => {
  it("turns recorded outcomes into bounded, explainable analytics", () => {
    const statuses = ["submitted", "interviewing", "hired"];
    const funnel = buildFunnel({ discovered: 12, qualified: 8, proposals: 5, statuses });
    const apps = statuses.map((status, index) => ({ id: String(index), jobId: String(index), status, createdAt: "2026-10-01", submittedAt: "2026-10-01", bidAmount: 500, connectsCost: 10, boostConnects: 0, earnings: status === "hired" ? 1000 : 0, earningsConfirmed: status === "hired", timeInvestedMinutes: 30, timeConfirmed: true }));
    const roi = calculateApplicationRoi(apps, [{ source: "deepseek", model: "deepseek-flash", amountUsd: 0.2, estimated: true, occurredAt: "2026-10-01" }], 0.15);
    const adjustments = boundedAdjustments([{ factor: "category:Frontend", recommended: true, outcome: "interview" }, { factor: "category:Frontend", recommended: true, outcome: "hired" }, { factor: "category:Frontend", recommended: true, outcome: "rejected" }], true, 5);
    expect(funnel.at(-1)?.count).toBe(1);
    expect(roi.earningsPerConnect).toBeCloseTo(33.333, 2);
    expect(adjustments[0]).toMatchObject({ factor: "category:Frontend", sampleSize: 3 });
  });
});
