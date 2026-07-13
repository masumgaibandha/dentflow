import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { createStaffUser, listUsers, updateUserStatus } from "./user.service";
import { createStaffSchema, listUsersQuerySchema, updateUserStatusSchema } from "./user.validation";

function parseListQuery(req: Request) {
  const parsedQuery = listUsersQuerySchema.safeParse(req.query);
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
  const result = await listUsers(req.user!.clinicId, query);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createStaffSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createStaffUser(req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateUserStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateUserStatus(
    req.user!.clinicId,
    String(req.params.id),
    req.user!.userId,
    parsed.data.isActive,
  );
  res.json(result);
});
