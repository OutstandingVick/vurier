export function retryDelay(attempt: number, baseMs = 1_000, capMs = 60_000) {
  return Math.min(capMs, baseMs * 2 ** Math.max(0, attempt - 1));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { attempts?: number; retryable?: (error: unknown) => boolean } = {},
) {
  const attempts = options.attempts ?? 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === attempts || options.retryable?.(error) === false)
        throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
    }
  }
  throw new Error("Retry attempts exhausted.");
}
