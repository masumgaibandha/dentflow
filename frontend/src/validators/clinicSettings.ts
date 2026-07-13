import { z } from "zod";
import { WEEKDAYS } from "@/lib/weekdays";

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Kept as a single uniform shape (not a discriminated union) so React Hook
// Form always has a stable set of fields to register per day - openTime/
// closeTime stay present (just visually disabled) when isClosed is true, and
// are stripped out at submit time in ClinicSettingsForm before the request
// goes out, matching the backend's stricter discriminated shape.
const dayHoursFormSchema = z
  .object({
    isClosed: z.boolean(),
    openTime: z.string(),
    closeTime: z.string(),
  })
  .superRefine((day, ctx) => {
    if (day.isClosed) return;

    if (!HHMM_REGEX.test(day.openTime)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid opening time", path: ["openTime"] });
    }
    if (!HHMM_REGEX.test(day.closeTime)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid closing time", path: ["closeTime"] });
    }
    if (
      HHMM_REGEX.test(day.openTime) &&
      HHMM_REGEX.test(day.closeTime) &&
      day.openTime >= day.closeTime
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Opening time must be before closing time",
        path: ["closeTime"],
      });
    }
  });

export type DayHoursFormValues = z.infer<typeof dayHoursFormSchema>;

const weeklyHoursFormShape = Object.fromEntries(
  WEEKDAYS.map((day) => [day, dayHoursFormSchema]),
) as Record<(typeof WEEKDAYS)[number], typeof dayHoursFormSchema>;

export const weeklyHoursFormSchema = z.object(weeklyHoursFormShape);

export type WeeklyHoursFormValues = z.infer<typeof weeklyHoursFormSchema>;

export const DEFAULT_DAY_HOURS: DayHoursFormValues = {
  isClosed: false,
  openTime: "09:00",
  closeTime: "17:00",
};

export const clinicSettingsFormSchema = z.object({
  name: z.string().trim().min(2, "Clinic name is required"),
  address: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  timezone: z.string().trim().optional().or(z.literal("")),
  weeklyHours: weeklyHoursFormSchema,
});

export type ClinicSettingsFormValues = z.infer<typeof clinicSettingsFormSchema>;
