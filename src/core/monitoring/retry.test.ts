import { describe, expect, it, vi } from "vitest";
import { retryDelay, withRetry } from "./retry";

describe("monitor retry", () => {
  it("uses capped exponential delays", () => {
    expect(retryDelay(1)).toBe(1_000);
    expect(retryDelay(9)).toBe(60_000);
  });
  it("retries transient failures", async () => {
    vi.useFakeTimers();
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue("ok");
    const result = withRetry(operation);
    await vi.runAllTimersAsync();
    await expect(result).resolves.toBe("ok");
    vi.useRealTimers();
  });
  it("stops on non-retryable failures", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("permission"));
    await expect(
      withRetry(operation, { retryable: () => false }),
    ).rejects.toThrow("permission");
    expect(operation).toHaveBeenCalledOnce();
  });
});
