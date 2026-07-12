import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

/**
 * Attaches req.user if a valid Bearer token is present, but never rejects the
 * request - used by routes that serve both an authenticated "my own data"
 * view and a public, differently-scoped view (e.g. GET /api/treatments).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // invalid/expired token on an optional-auth route: treat as anonymous
    }
  }

  next();
}
