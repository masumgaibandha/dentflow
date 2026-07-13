import { z } from "zod";

export const patientFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone is required").optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
