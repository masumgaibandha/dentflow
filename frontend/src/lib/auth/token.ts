const TOKEN_KEY = "dentflow_token";

/**
 * Stored in localStorage rather than an httpOnly cookie because the frontend
 * and backend are separate Vercel deployments (different origins) and this is
 * a deadline-scoped trade-off. Known risk: exposure to XSS. Planned migration:
 * httpOnly, SameSite cookie-based sessions post-submission.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
