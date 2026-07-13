import { z } from "zod";

export const portalAppointmentFormSchema = z.object({
  dentistId: z.string().min(1, "Select a dentist"),
  treatmentId: z.string().min(1, "Select a treatment"),
  startTime: z.string().min(1, "Select a date and time"),
});

export type PortalAppointmentFormValues = z.infer<typeof portalAppointmentFormSchema>;
