import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  listInvoices,
  markInvoicePaid,
  updateInvoice,
  voidInvoice,
} from "./invoice.service";
import {
  invoiceInputSchema,
  listInvoicesQuerySchema,
  markPaidSchema,
  updateInvoiceSchema,
} from "./invoice.validation";

function parseListQuery(req: Request) {
  const parsedQuery = listInvoicesQuerySchema.safeParse(req.query);
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
  const result = await listInvoices(req.user!.clinicId, query);
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const result = await getInvoiceById(String(req.params.id), req.user!.clinicId);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = invoiceInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await createInvoice(req.user!.clinicId, parsed.data);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await updateInvoice(String(req.params.id), req.user!.clinicId, parsed.data);
  res.json(result);
});

export const markPaid = asyncHandler(async (req: Request, res: Response) => {
  const parsed = markPaidSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues[0]?.message ?? "Invalid input",
      "VALIDATION_ERROR",
    );
  }

  const result = await markInvoicePaid(String(req.params.id), req.user!.clinicId, parsed.data);
  res.json(result);
});

export const voidOne = asyncHandler(async (req: Request, res: Response) => {
  const result = await voidInvoice(String(req.params.id), req.user!.clinicId);
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteInvoice(String(req.params.id), req.user!.clinicId);
  res.status(204).send();
});
