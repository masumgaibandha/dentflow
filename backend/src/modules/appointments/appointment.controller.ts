import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointment,
} from "./appointment.service";
import {
  appointmentInputSchema,
  listAppointmentsQuerySchema,
  updateAppointmentSchema,
} from "./appointment.validation";

function parseListQuery(req: Request) {
  const parsedQuery = listAppointmentsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new ApiError(
      400,
      parsedQuery.error.issues[0]?.message ?? "Invalid query",
      "VALIDATION_ERROR",
    );
  }

  return parsedQuery.data;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await listAppointments(req.user!.clinicId, query);
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAppointmentById(String(req.params.id), req.user!.clinicId);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = appointmentInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createAppointment(req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateAppointment(String(req.params.id), req.user!.clinicId, parsed.data);
  res.json(result);
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const result = await cancelAppointment(String(req.params.id), req.user!.clinicId);
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteAppointment(String(req.params.id), req.user!.clinicId);
  res.status(204).send();
});
