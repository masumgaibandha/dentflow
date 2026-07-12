import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createTreatment,
  deleteTreatment,
  getPublicTreatmentById,
  listTreatmentsForAdmin,
  listTreatmentsForPublicClinic,
  updateTreatment,
} from "./treatment.service";
import {
  listTreatmentsQuerySchema,
  treatmentInputSchema,
  updateTreatmentSchema,
} from "./treatment.validation";

function parseListQuery(req: Request) {
  const parsedQuery = listTreatmentsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new ApiError(
      400,
      parsedQuery.error.issues[0]?.message ?? "Invalid query",
      "VALIDATION_ERROR",
    );
  }

  return parsedQuery.data;
}

export const listAdminTreatments = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await listTreatmentsForAdmin(req.user!.clinicId, query);
  res.json(result);
});

export const listPublicTreatments = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const slug = query.clinic;

  if (!slug) {
    throw new ApiError(400, "clinic query parameter is required", "CLINIC_REQUIRED");
  }

  const result = await listTreatmentsForPublicClinic(slug, query);
  res.json(result);
});

export const getPublicTreatment = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const slug = typeof req.query.clinic === "string" ? req.query.clinic : undefined;
  if (!slug) {
    throw new ApiError(400, "clinic query parameter is required", "CLINIC_REQUIRED");
  }

  const result = await getPublicTreatmentById(id, slug);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = treatmentInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createTreatment(req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateTreatmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateTreatment(String(req.params.id), req.user!.clinicId, parsed.data);
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteTreatment(String(req.params.id), req.user!.clinicId);
  res.status(204).send();
});
