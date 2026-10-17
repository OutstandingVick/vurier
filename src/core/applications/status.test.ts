import { describe, expect, it } from "vitest";
import { mapUpworkStatus } from "@/core/applications/status";
describe("provider statuses", () => {
  it("maps known values without fabricating unknown ones", () => {
    expect(mapUpworkStatus("Hired")).toBe("hired");
    expect(mapUpworkStatus("Mystery")).toBeNull();
  });
});
