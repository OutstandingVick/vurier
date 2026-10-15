export class UpworkApiError extends Error {
  constructor(message: string, readonly status?: number, readonly code?: string, readonly retryAfterSeconds?: number) {
    super(message);
    this.name = "UpworkApiError";
  }
}

export class UpworkPermissionError extends UpworkApiError {
  constructor(message = "The connected Upwork account does not permit this operation.") {
    super(message, 403, "permission_denied");
    this.name = "UpworkPermissionError";
  }
}

export class UpworkRateLimitError extends UpworkApiError {
  constructor(retryAfterSeconds = 60) {
    super("Upwork rate limit reached. Try again after the cooldown.", 429, "rate_limited", retryAfterSeconds);
    this.name = "UpworkRateLimitError";
  }
}
