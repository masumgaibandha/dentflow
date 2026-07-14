import { z } from "zod";
import { MEDICAL_RECORD_STATUSES, MEDICAL_RECORD_TYPES } from "../../models/MedicalRecord";

const objectIdSchema = z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// Validates the :id route param before it ever reaches a Mongo query, so a
// malformed id produces a controlled 400 instead of a Mongoose CastError
// surfacing as a 500.
export const medicalRecordIdParamSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid medical record id");

// A clinical record can legitimately be backdated (documenting a past visit
// entered late), but never dated meaningfully in the future - this allowance
// exists purely to tolerate client/server clock drift, not to permit
// scheduling future clinical entries.
export const RECORD_DATE_CLOCK_SKEW_MS = 5 * 60_000;

const recordDateSchema = z.coerce
  .date()
  .refine((date) => date.getTime() <= Date.now() + RECORD_DATE_CLOCK_SKEW_MS, {
    message: "Record date cannot be in the future",
  });

const titleSchema = z.string().trim().min(1, "Title is required").max(200, "Title is too long");

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(10_000, "Description is too long");

// .strict() rejects the request outright (400) if it contains any other key
// (clinicId, authorUserId, status, finalizedAt, amendedRecordId,
// createdAt/updatedAt, etc.) rather than silently ignoring them.
export const createMedicalRecordSchema = z
  .object({
    patientId: objectIdSchema,
    appointmentId: objectIdSchema.optional(),
    attendingDentistId: objectIdSchema.optional(),
    recordType: z.enum(MEDICAL_RECORD_TYPES),
    title: titleSchema,
    description: descriptionSchema,
    recordDate: recordDateSchema.optional(),
  })
  .strict();

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;

// Only fields that remain editable while a record is still a draft - status,
// clinicId, patientId, authorUserId, finalizedAt, and amendment relationships
// are all deliberately absent, not just unused.
export const updateMedicalRecordSchema = z
  .object({
    appointmentId: objectIdSchema.optional(),
    attendingDentistId: objectIdSchema.optional(),
    recordType: z.enum(MEDICAL_RECORD_TYPES).optional(),
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    recordDate: recordDateSchema.optional(),
  })
  .strict();

export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;

// The amendment inherits patientId, appointmentId, attendingDentistId, and
// recordType from the original finalized record it corrects (see
// createAmendment in medical-record.service.ts) - only the new clinical text
// and the reason for the correction are supplied here.
export const createAmendmentSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    amendmentReason: z
      .string()
      .trim()
      .min(1, "Amendment reason is required")
      .max(500, "Amendment reason is too long"),
    recordDate: recordDateSchema.optional(),
  })
  .strict();

export type CreateAmendmentInput = z.infer<typeof createAmendmentSchema>;

// patientId is required for list queries in this milestone: clinical records
// are reviewed in the context of one selected patient, never as a broad
// clinic-wide feed (see dashboard IA - /patients/:patientId/medical-records).
export const listMedicalRecordsQuerySchema = z
  .object({
    patientId: objectIdSchema,
    appointmentId: objectIdSchema.optional(),
    attendingDentistId: objectIdSchema.optional(),
    status: z.enum(MEDICAL_RECORD_STATUSES).optional(),
    recordType: z.enum(MEDICAL_RECORD_TYPES).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type ListMedicalRecordsQuery = z.infer<typeof listMedicalRecordsQuerySchema>;
