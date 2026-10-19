import { describe, expect, it } from "vitest";
import { associationNote, compareStrategies } from "./strategy";
describe("strategy associations", () => {
  it("groups outcomes without claiming causation", () => {
    const rows = Array.from({ length: 5 }, (_, index) => ({
      dimension: "frontend",
      status: index === 0 ? "hired" : "submitted",
      earnings: index === 0 ? 1000 : 0,
    }));
    const result = compareStrategies(rows);
    expect(result[0]).toMatchObject({
      applications: 5,
      hires: 1,
      sampleSufficient: true,
    });
    expect(associationNote(true)).toMatch(/association/);
  });
  it("keeps missing dimensions explicit", () =>
    expect(
      compareStrategies([
        { dimension: null, status: "submitted", earnings: null },
      ])[0].label,
    ).toBe("Not recorded"));
});
