import { z } from "zod";

export const appointmentFormSchema = z
  .object({
    patientId: z.string().min(1, "Select a patient"),
    dentistId: z.string().min(1, "Select a dentist"),
    treatmentId: z.string().optional().or(z.literal("")),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => new Date(data.endTime).getTime() > new Date(data.startTime).getTime(),
    { message: "End time must be later than start time", path: ["endTime"] },
  );

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
