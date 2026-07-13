import { z } from "zod";
import { PAYMENT_METHODS } from "@/lib/api/invoicesApi";

export const lineItemFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or greater"),
});

export type LineItemFormValues = z.infer<typeof lineItemFormSchema>;

export const invoiceFormSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  appointmentId: z.string().optional().or(z.literal("")),
  lineItems: z.array(lineItemFormSchema).min(1, "At least one line item is required"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const markPaidFormSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().optional().or(z.literal("")),
});

export type MarkPaidFormValues = z.infer<typeof markPaidFormSchema>;
