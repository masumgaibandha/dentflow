import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  cancelPortalAppointment,
  createInvoicePaymentIntent,
  createPortalAppointment,
  getPortalAppointments,
  getPortalInvoiceById,
  getPortalMe,
  listPortalDentists,
  listPortalInvoices,
  listPortalTreatments,
  verifyInvoicePayment,
} from "./portal.service";
import {
  appointmentIdParamSchema,
  createPortalAppointmentSchema,
  invoiceIdParamSchema,
  listPortalInvoicesQuerySchema,
  portalAppointmentsQuerySchema,
  portalDentistsQuerySchema,
  portalTreatmentsQuerySchema,
  verifyPaymentSchema,
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

export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const parsedId = invoiceIdParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new ApiError(400, parsedId.error.issues[0]?.message ?? "Invalid invoice id", "VALIDATION_ERROR");
  }

  const result = await createInvoicePaymentIntent(
    req.user!.clinicId,
    req.user!.patientId!,
    parsedId.data,
  );
  res.json(result);
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const parsedId = invoiceIdParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new ApiError(400, parsedId.error.issues[0]?.message ?? "Invalid invoice id", "VALIDATION_ERROR");
  }
  const parsedBody = verifyPaymentSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw new ApiError(
      400,
      parsedBody.error.issues[0]?.message ?? "Invalid request body",
      "VALIDATION_ERROR",
    );
  }

  const result = await verifyInvoicePayment(
    req.user!.clinicId,
    req.user!.patientId!,
    parsedId.data,
    parsedBody.data.paymentIntentId,
  );
  res.json(result);
});

export const getDentists = asyncHandler(async (req: Request, res: Response) => {
  const parsed = portalDentistsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid query", "VALIDATION_ERROR");
  }

  const result = await listPortalDentists(req.user!.clinicId, parsed.data);
  res.json(result);
});

export const getTreatments = asyncHandler(async (req: Request, res: Response) => {
  const parsed = portalTreatmentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid query", "VALIDATION_ERROR");
  }

  const result = await listPortalTreatments(req.user!.clinicId, parsed.data);
  res.json(result);
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = createPortalAppointmentSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw new ApiError(
      400,
      parsedBody.error.issues[0]?.message ?? "Invalid request body",
      "VALIDATION_ERROR",
    );
  }

  // Required so rapid duplicate submissions (double-click, a client retry
  // after a dropped response) can be deduped server-side - frontend button
  // disabling alone is not a reliable guard against either.
  const idempotencyKey = req.header("Idempotency-Key")?.trim();
  if (!idempotencyKey) {
    throw new ApiError(400, "Idempotency-Key header is required", "VALIDATION_ERROR");
  }

  const result = await createPortalAppointment(
    req.user!.clinicId,
    req.user!.patientId!,
    parsedBody.data,
    idempotencyKey,
  );
  res.status(201).json(result);
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const parsedId = appointmentIdParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new ApiError(
      400,
      parsedId.error.issues[0]?.message ?? "Invalid appointment id",
      "VALIDATION_ERROR",
    );
  }

  const result = await cancelPortalAppointment(
    req.user!.clinicId,
    req.user!.patientId!,
    parsedId.data,
  );
  res.json(result);
});
