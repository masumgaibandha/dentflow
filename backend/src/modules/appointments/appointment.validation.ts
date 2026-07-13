import { z } from "zod";
import { APPOINTMENT_STATUSES } from "../../models/Appointment";

const objectIdSchema = z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const appointmentInputSchema = z
  .object({
    patientId: objectIdSchema,
    dentistId: objectIdSchema,
    treatmentId: objectIdSchema.optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    status: z.enum(APPOINTMENT_STATUSES).default("scheduled"),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.endTime.getTime() > data.startTime.getTime(), {
    message: "endTime must be later than startTime",
    path: ["endTime"],
  });

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;

export const updateAppointmentSchema = z
  .object({
    patientId: objectIdSchema.optional(),
    dentistId: objectIdSchema.optional(),
    treatmentId: objectIdSchema.optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      !data.startTime || !data.endTime || data.endTime.getTime() > data.startTime.getTime(),
    {
      message: "endTime must be later than startTime",
      path: ["endTime"],
    },
  );

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

export const listAppointmentsQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  patientId: objectIdSchema.optional(),
  dentistId: objectIdSchema.optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  sortBy: z.enum(["startTime", "newest"]).default("startTime"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
