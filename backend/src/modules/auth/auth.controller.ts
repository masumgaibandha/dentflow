import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { getCurrentUser, loginUser, registerClinicAdmin } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await registerClinicAdmin(parsed.data);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await loginUser(parsed.data);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHENTICATED");
  }

  const result = await getCurrentUser(req.user.userId);
  res.status(200).json(result);
});
