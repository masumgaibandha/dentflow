import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyAccessToken } from "../utils/jwt";

// Deliberately loads the current User record on every request rather than
// trusting the JWT payload alone - a deactivated account's existing tokens
// must stop working immediately, not just at their natural expiry.
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      next(new ApiError(401, "Authentication required", "UNAUTHENTICATED"));
      return;
    }

    const token = header.slice("Bearer ".length);

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      next(new ApiError(401, "Invalid or expired token", "UNAUTHENTICATED"));
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      next(new ApiError(401, "Invalid or expired token", "UNAUTHENTICATED"));
      return;
    }

    if (!user.isActive) {
      next(
        new ApiError(
          401,
          "This account has been deactivated. Contact your clinic administrator.",
          "ACCOUNT_DEACTIVATED",
        ),
      );
      return;
    }

    if (user.role === "patient" && !user.patientId) {
      next(
        new ApiError(500, "Patient account is missing its linked record", "DATA_INTEGRITY_ERROR"),
      );
      return;
    }

    // Derived from the live record (not the JWT) so a role change - or a
    // patient's linked record - would take effect immediately too. patientId
    // in particular is never read from the token: it's resolved fresh here on
    // every request so it can never be forged or go stale after unlinking.
    req.user = {
      userId: user._id.toString(),
      clinicId: user.clinicId.toString(),
      role: user.role,
      patientId: user.patientId?.toString(),
    };
    next();
  },
);
