import { describe, expect, it } from "vitest";
import { findStyleWarnings } from "@/core/proposals/style";
describe("proposal style", () => {
  it("flags generic AI language", () =>
    expect(
      findStyleWarnings(
        "I am excited to apply and leverage cutting-edge tools",
      ),
    ).toHaveLength(3));
  it("accepts direct client-focused language", () =>
    expect(
      findStyleWarnings("Your checkout needs a faster payment state."),
    ).toEqual([]));
});
