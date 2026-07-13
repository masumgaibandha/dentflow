import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getPortalAppointments,
  getPortalInvoiceById,
  getPortalMe,
  listPortalInvoices,
} from "./portal.service";
import {
  invoiceIdParamSchema,
  listPortalInvoicesQuerySchema,
  portalAppointmentsQuerySchema,
} from "./portal.validation";

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

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listPortalInvoicesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid query",
      "VALIDATION_ERROR",
    );
  }

  const result = await listPortalInvoices(req.user!.clinicId, req.user!.patientId!, parsed.data);
  res.json(result);
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const parsedId = invoiceIdParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new ApiError(400, parsedId.error.issues[0]?.message ?? "Invalid invoice id", "VALIDATION_ERROR");
  }

  const result = await getPortalInvoiceById(
    req.user!.clinicId,
    req.user!.patientId!,
    parsedId.data,
  );
  res.json(result);
});
