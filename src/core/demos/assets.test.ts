import { describe, expect, it } from "vitest";
import { canAttachDemoAsset } from "./assets";
describe("demo attachment approval", () => {
  it("requires completed verified work", () =>
    expect(
      canAttachDemoAsset({
        status: "completed",
        verified: true,
        url: "https://example.com",
      }),
    ).toBe(true));
  it("blocks unfinished and unverified work", () => {
    expect(
      canAttachDemoAsset({
        status: "draft",
        verified: true,
        url: "https://example.com",
      }),
    ).toBe(false);
    expect(
      canAttachDemoAsset({
        status: "completed",
        verified: false,
        filePath: "file.pdf",
      }),
    ).toBe(false);
  });
});
