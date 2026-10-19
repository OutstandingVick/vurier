import { describe, expect, it, vi } from "vitest";
import { logEvent, sanitizeMetadata } from "./logger";
describe("structured logging", () => {
  it("redacts secret-shaped metadata", () =>
    expect(
      sanitizeMetadata({
        requestId: "r",
        accessToken: "secret",
        password: "p",
      }),
    ).toEqual({
      requestId: "r",
      accessToken: "[REDACTED]",
      password: "[REDACTED]",
    }));
  it("emits structured JSON", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    logEvent("info", "health_checked", { requestId: "r" });
    expect(() => JSON.parse(String(spy.mock.calls[0][0]))).not.toThrow();
    spy.mockRestore();
  });
});
