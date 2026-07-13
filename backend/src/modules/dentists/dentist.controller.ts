import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createDentist,
  deleteDentist,
  getDentistById,
  listDentists,
  updateDentist,
} from "./dentist.service";
import { dentistInputSchema, listDentistsQuerySchema, updateDentistSchema } from "./dentist.validation";

function parseListQuery(req: Request) {
  const parsedQuery = listDentistsQuerySchema.safeParse(req.query);
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
  const result = await listDentists(req.user!.clinicId, query);
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDentistById(String(req.params.id), req.user!.clinicId);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = dentistInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createDentist(req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateDentistSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateDentist(String(req.params.id), req.user!.clinicId, parsed.data);
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteDentist(String(req.params.id), req.user!.clinicId);
  res.status(204).send();
});
