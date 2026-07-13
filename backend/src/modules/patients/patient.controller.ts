import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createPatient,
  createPortalAccount,
  deletePatient,
  getPatientById,
  listPatients,
  updatePatient,
} from "./patient.service";
import {
  createPortalAccountSchema,
  listPatientsQuerySchema,
  patientInputSchema,
  updatePatientSchema,
} from "./patient.validation";

function parseListQuery(req: Request) {
  const parsedQuery = listPatientsQuerySchema.safeParse(req.query);
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
  const result = await listPatients(req.user!.clinicId, query, req.user!.role);
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const result = await getPatientById(String(req.params.id), req.user!.clinicId, req.user!.role);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = patientInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createPatient(req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updatePatientSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updatePatient(String(req.params.id), req.user!.clinicId, parsed.data);
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deletePatient(String(req.params.id), req.user!.clinicId);
  res.status(204).send();
});

export const createPortalAccountHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createPortalAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createPortalAccount(String(req.params.id), req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});
