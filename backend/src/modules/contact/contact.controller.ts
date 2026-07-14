import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { createContactMessage } from "./contact.service";
import { createContactMessageSchema } from "./contact.validation";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createContactMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createContactMessage(parsed.data);
  res.status(201).json(result);
});
