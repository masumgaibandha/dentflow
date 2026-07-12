import { ApiClientError } from "@/lib/api/client";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return "Network error. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
