import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { getMyClinic, updateMyClinic } from "./clinic.service";
import { updateClinicSchema } from "./clinic.validation";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMyClinic(req.user!.clinicId);
  res.json(result);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateClinicSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateMyClinic(req.user!.clinicId, parsed.data);
  res.json(result);
});
