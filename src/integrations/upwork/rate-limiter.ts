import { UpworkRateLimitError } from "@/integrations/upwork/errors";

type Bucket = { tokens: number; updatedAt: number };

export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  constructor(private readonly capacity = 8, private readonly refillPerSecond = 1) {}

  consume(key: string, now = Date.now()) {
    const current = this.buckets.get(key) ?? { tokens: this.capacity, updatedAt: now };
    const elapsed = Math.max(0, now - current.updatedAt) / 1000;
    current.tokens = Math.min(this.capacity, current.tokens + elapsed * this.refillPerSecond);
    current.updatedAt = now;
    if (current.tokens < 1) {
      this.buckets.set(key, current);
      throw new UpworkRateLimitError(Math.ceil((1 - current.tokens) / this.refillPerSecond));
    }
    current.tokens -= 1;
    this.buckets.set(key, current);
  }
}
