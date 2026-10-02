import { isAxiosError } from "axios";

/**
 * Pulls the backend's `message` out of an API error, falling back to a
 * friendly default for network errors and anything unexpected.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message) return message;
  }

  return fallback;
}
