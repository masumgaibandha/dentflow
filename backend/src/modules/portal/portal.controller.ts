import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPortalAppointments, getPortalMe } from "./portal.service";
import { portalAppointmentsQuerySchema } from "./portal.validation";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // requireAuth + requireRole("patient") already guarantee req.user.patientId
  // is set (a patient-role user missing it is rejected upstream as a
  // data-integrity error), so this is a safe non-null read here.
  const result = await getPortalMe(req.user!.userId, req.user!.clinicId, req.user!.patientId!);
  res.json(result);
});

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const parsed = portalAppointmentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid query",
      "VALIDATION_ERROR",
    );
  }

  const result = await getPortalAppointments(
    req.user!.clinicId,
    req.user!.patientId!,
    parsed.data,
  );
  res.json(result);
});
