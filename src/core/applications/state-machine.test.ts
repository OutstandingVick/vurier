import { describe, expect, it } from "vitest";
import { assertApplicationTransition } from "@/core/applications/state-machine";
describe("application state machine", () => {
  it("allows review and submission flow", () => {
    expect(() =>
      assertApplicationTransition("draft", "ready_for_review"),
    ).not.toThrow();
    expect(() =>
      assertApplicationTransition("approved", "submitting"),
    ).not.toThrow();
  });
  it("blocks bypassing approval", () =>
    expect(() => assertApplicationTransition("draft", "submitted")).toThrow(
      /Invalid/,
    ));
});
