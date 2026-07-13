import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getDashboardSummary } from "./dashboard.service";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDashboardSummary(req.user!.clinicId);
  res.json(result);
});
