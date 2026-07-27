/**
 * Retries an async function with exponential backoff + jitter.
 * Only retries errors that look transient (rate limits, timeouts,
 * server errors) -- a genuinely bad request (e.g. malformed prompt)
 * will just fail the same way every time, so retrying it is wasted
 * latency. Everything else fails fast.
 */

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

function getStatusCode(error: unknown): number | undefined {
  if (error && typeof error === "object") {
    // The Gemini SDK throws errors with a `status` field, and some
    // fetch-based errors nest it under `.response.status` instead --
    // check both shapes rather than assuming one.
    const err = error as { status?: number; response?: { status?: number } };
    return err.status ?? err.response?.status;
  }
  return undefined;
}

function isRetryable(error: unknown): boolean {
  const status = getStatusCode(error);
  if (status && RETRYABLE_STATUS_CODES.includes(status)) return true;

  // Network-level failures (DNS, connection reset, fetch timeout)
  // don't come with an HTTP status at all -- retry those too.
  if (error instanceof TypeError && /fetch/i.test(error.message)) return true;

  return false;
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 500, maxDelayMs = 8000 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }

      // Exponential backoff with jitter: 2^(attempt-1) * base, capped,
      // plus up to 30% random jitter so many concurrent requests
      // hitting a rate limit don't all retry in lockstep.
      const exponentialDelay = baseDelayMs * 2 ** (attempt - 1);
      const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
      const jitter = cappedDelay * 0.3 * Math.random();
      const delay = cappedDelay + jitter;

      console.warn(
        `[withRetry] attempt ${attempt}/${maxAttempts} failed, retrying in ${Math.round(
          delay
        )}ms`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Unreachable in practice (the loop always returns or throws), but
  // keeps TypeScript happy about all code paths returning/throwing.
  throw lastError;
}
