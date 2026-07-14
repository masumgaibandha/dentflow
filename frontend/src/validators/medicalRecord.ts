import { z } from "zod";
import { MEDICAL_RECORD_TYPES } from "@/lib/api/medicalRecordsApi";

export const medicalRecordFormSchema = z.object({
  recordType: z.enum(MEDICAL_RECORD_TYPES, { message: "Select a record type" }),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(10_000, "Description is too long"),
  recordDate: z.string().trim().optional().or(z.literal("")),
  appointmentId: z.string().trim().optional().or(z.literal("")),
  attendingDentistId: z.string().trim().optional().or(z.literal("")),
});

export type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

export const amendmentFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Correction text is required")
    .max(10_000, "Description is too long"),
  amendmentReason: z
    .string()
    .trim()
    .min(1, "Amendment reason is required")
    .max(500, "Amendment reason is too long"),
});

export type AmendmentFormValues = z.infer<typeof amendmentFormSchema>;
