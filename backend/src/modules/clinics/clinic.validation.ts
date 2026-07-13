import { z } from "zod";
import { isValidTimezone } from "../../utils/timezone";

// Explicit allowlist: only these keys are ever accepted. `.strict()` rejects
// the request outright (400) if it contains any other key - including
// slug, invoiceSequence, _id, createdAt, updatedAt, or anything unrecognized -
// rather than silently stripping them, so a caller gets a clear signal.
export const updateClinicSchema = z
  .object({
    name: z.string().trim().min(2, "Clinic name is required"),
    address: z.string().trim().optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
    timezone: z
      .string()
      .trim()
      .refine(isValidTimezone, "Invalid timezone")
      .optional()
      .or(z.literal("")),
  })
  .strict();

export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;
