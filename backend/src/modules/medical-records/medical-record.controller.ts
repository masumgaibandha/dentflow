import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createAmendment,
  createMedicalRecord,
  deleteDraftMedicalRecord,
  finalizeMedicalRecord,
  getMedicalRecordById,
  listMedicalRecords,
  updateMedicalRecord,
} from "./medical-record.service";
import {
  createAmendmentSchema,
  createMedicalRecordSchema,
  listMedicalRecordsQuerySchema,
  medicalRecordIdParamSchema,
  updateMedicalRecordSchema,
} from "./medical-record.validation";

function parseId(req: Request): string {
  const parsed = medicalRecordIdParamSchema.safeParse(req.params.id);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid id", "VALIDATION_ERROR");
  }
  return parsed.data;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listMedicalRecordsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid query",
      "VALIDATION_ERROR",
    );
  }

  const result = await listMedicalRecords(req.user!.clinicId, parsed.data);
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req);
  const result = await getMedicalRecordById(id, req.user!.clinicId);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createMedicalRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  // Never accepted from the client - always the authenticated caller.
  const result = await createMedicalRecord(req.user!.clinicId, req.user!.userId, parsed.data);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req);
  const parsed = updateMedicalRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateMedicalRecord(id, req.user!.clinicId, parsed.data);
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req);
  await deleteDraftMedicalRecord(id, req.user!.clinicId);
  res.status(204).send();
});

export const finalize = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req);
  const result = await finalizeMedicalRecord(id, req.user!.clinicId);
  res.json(result);
});

export const amend = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req);
  const parsed = createAmendmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  // Required so rapid duplicate submissions (double-click, a client retry
  // after a dropped response) can be deduped server-side.
  const idempotencyKey = req.header("Idempotency-Key")?.trim();
  if (!idempotencyKey) {
    throw new ApiError(400, "Idempotency-Key header is required", "VALIDATION_ERROR");
  }

  const result = await createAmendment(
    id,
    req.user!.clinicId,
    req.user!.userId,
    parsed.data,
    idempotencyKey,
  );
  res.status(201).json(result);
});
