import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPortalMe } from "./portal.service";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // requireAuth + requireRole("patient") already guarantee req.user.patientId
  // is set (a patient-role user missing it is rejected upstream as a
  // data-integrity error), so this is a safe non-null read here.
  const result = await getPortalMe(req.user!.userId, req.user!.clinicId, req.user!.patientId!);
  res.json(result);
});
