import { describe, expect, it } from "vitest";
import { AI_RESERVES } from "./ai-reservation";
describe("AI budget reserves", () => {
  it("uses bounded worst-case reserves for every paid workflow", () => {
    expect(
      Object.values(AI_RESERVES).every((value) => value > 0 && value <= 5),
    ).toBe(true);
  });
});
