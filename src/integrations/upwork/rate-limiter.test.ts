import { describe, expect, it } from "vitest";
import { TokenBucketRateLimiter } from "@/integrations/upwork/rate-limiter";
import { UpworkRateLimitError } from "@/integrations/upwork/errors";

describe("Upwork rate limiter", () => {
  it("limits bursts and refills over time", () => {
    const limiter = new TokenBucketRateLimiter(2, 1);
    limiter.consume("user", 0);
    limiter.consume("user", 0);
    expect(() => limiter.consume("user", 0)).toThrow(UpworkRateLimitError);
    expect(() => limiter.consume("user", 1000)).not.toThrow();
  });
  it("isolates user buckets", () => {
    const limiter = new TokenBucketRateLimiter(1, 1);
    limiter.consume("one", 0);
    expect(() => limiter.consume("two", 0)).not.toThrow();
  });
});
