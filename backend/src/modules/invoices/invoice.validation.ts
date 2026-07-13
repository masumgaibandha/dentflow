import { z } from "zod";
import { INVOICE_STATUSES, PAYMENT_METHODS } from "../../models/Invoice";

const objectIdSchema = z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const lineItemInputSchema = z.object({
  title: z.string().trim().min(1, "Line item title is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  unitPriceCents: z.coerce.number().int().min(0, "Unit price must be 0 or greater"),
});

export type LineItemInput = z.infer<typeof lineItemInputSchema>;

export const invoiceInputSchema = z.object({
  patientId: objectIdSchema,
  appointmentId: objectIdSchema.optional(),
  lineItems: z.array(lineItemInputSchema).min(1, "At least one line item is required"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;

export const updateInvoiceSchema = invoiceInputSchema.partial();

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export const markPaidSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().optional().or(z.literal("")),
});

export type MarkPaidInput = z.infer<typeof markPaidSchema>;

export const listInvoicesQuerySchema = z.object({
  status: z.enum(INVOICE_STATUSES).optional(),
  patientId: objectIdSchema.optional(),
  appointmentId: objectIdSchema.optional(),
  // Filters against createdAt unless another field is explicitly selected via dateField.
  dateField: z.enum(["createdAt"]).default("createdAt"),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "totalCents", "invoiceNumber"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
