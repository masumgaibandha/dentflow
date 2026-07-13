import { z } from "zod";

const objectIdSchema = z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// .strict() rejects the request outright (400) if it contains any other key -
// in particular clinicId/patientId/dentistId/treatmentId, which must never be
// accepted from the client for this endpoint. sortBy is intentionally not a
// parameter at all: it's fixed to startTime (see portal.service.ts).
export const portalAppointmentsQuerySchema = z
  .object({
    when: z.enum(["upcoming", "past"]).default("upcoming"),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type PortalAppointmentsQuery = z.infer<typeof portalAppointmentsQuerySchema>;

// Sort is intentionally not a parameter at all: fixed to createdAt descending
// (see portal.service.ts). Only page/limit are accepted.
export const listPortalInvoicesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type ListPortalInvoicesQuery = z.infer<typeof listPortalInvoicesQuerySchema>;

// Validates the :id route param before it ever reaches a Mongo query, so a
// malformed id produces a controlled 400 instead of a Mongoose CastError
// surfacing as a 500.
export const invoiceIdParamSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid invoice id");

// .strict() so a client cannot smuggle amount/currency/status alongside the
// PaymentIntent id - the only thing this endpoint trusts from the client at
// all is which PaymentIntent to re-verify against Stripe directly.
export const verifyPaymentSchema = z
  .object({
    paymentIntentId: z.string().trim().min(1, "paymentIntentId is required"),
  })
  .strict();

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// Lookup lists for the booking form's dentist/treatment dropdowns - a small,
// clinic-scoped set, so the default limit is generous compared to the
// paginated admin tables (still capped and still validated, never
// unbounded).
export const portalDentistsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export type PortalDentistsQuery = z.infer<typeof portalDentistsQuerySchema>;

export const portalTreatmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export type PortalTreatmentsQuery = z.infer<typeof portalTreatmentsQuerySchema>;

// Validates the :id route param for the cancel endpoint before it reaches Mongo.
export const appointmentIdParamSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid appointment id");

// .strict() rejects clinicId/patientId/endTime/status/notes/createdBy/price/
// durationMinutes and anything else a client might try to smuggle in - the
// server derives or computes every one of those itself.
export const createPortalAppointmentSchema = z
  .object({
    dentistId: objectIdSchema,
    treatmentId: objectIdSchema,
    startTime: z.coerce.date({ message: "startTime must be a valid date" }),
  })
  .strict()
  .refine((data) => data.startTime.getTime() > Date.now(), {
    message: "startTime must be in the future",
    path: ["startTime"],
  });

export type CreatePortalAppointmentInput = z.infer<typeof createPortalAppointmentSchema>;
