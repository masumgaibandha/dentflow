import { z } from "zod";
import { WEEKDAYS } from "../../models/Clinic";
import { isValidTimezone } from "../../utils/timezone";

// Strict 24h HH:mm only - rejects "9:00" (unpadded), "24:00"/"17:75" (out of
// range), and anything with seconds/AM-PM/other separators.
const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Discriminated on isClosed so each branch's own .strict() enforces the
// "closed day must not require times" / "open day requires both times"
// rules structurally - a closed day payload that also includes openTime is
// rejected outright rather than silently ignored.
const dayHoursSchema = z
  .discriminatedUnion("isClosed", [
    z
      .object({
        isClosed: z.literal(true),
      })
      .strict(),
    z
      .object({
        isClosed: z.literal(false),
        openTime: z.string().regex(HHMM_REGEX, "openTime must be in 24-hour HH:mm format"),
        closeTime: z.string().regex(HHMM_REGEX, "closeTime must be in 24-hour HH:mm format"),
      })
      .strict(),
  ])
  .refine((day) => day.isClosed || day.openTime < day.closeTime, {
    message: "openTime must be earlier than closeTime",
    path: ["closeTime"],
  });

// All seven days required together - there is no partial-week update; the
// client always sends (and the admin UI always renders) the full week.
const weeklyHoursShape = Object.fromEntries(WEEKDAYS.map((day) => [day, dayHoursSchema])) as Record<
  (typeof WEEKDAYS)[number],
  typeof dayHoursSchema
>;

export const weeklyHoursSchema = z.object(weeklyHoursShape).strict();

export type WeeklyHoursInput = z.infer<typeof weeklyHoursSchema>;

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
    weeklyHours: weeklyHoursSchema.optional(),
  })
  .strict();

export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;
