import { z } from "zod";

export const portalAppointmentFormSchema = z.object({
  dentistId: z.string().min(1, "Select a dentist"),
  treatmentId: z.string().min(1, "Select a treatment"),
  date: z.string().min(1, "Select a date"),
});

export type PortalAppointmentFormValues = z.infer<typeof portalAppointmentFormSchema>;
