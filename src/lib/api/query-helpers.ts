import { ApiError } from "@/lib/api/client";

/** Don't retry when MongoDB / Atlas is unreachable. */
export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
  maxRetries = 1,
): boolean {
  if (error instanceof ApiError && error.status === 503) return false;
  return failureCount < maxRetries;
}

export function getApiErrorMessage(
  queries: Array<{ error: unknown }>,
): string | null {
  for (const q of queries) {
    if (q.error instanceof ApiError) return q.error.message;
    if (q.error instanceof Error) return q.error.message;
  }
  return null;
}
