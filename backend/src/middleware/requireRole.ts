import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import type { UserRole } from "../models/User";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "Insufficient permissions", "FORBIDDEN"));
      return;
    }
    next();
  };
}
