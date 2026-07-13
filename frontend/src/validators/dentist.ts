import { z } from "zod";

export const dentistFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone is required").optional().or(z.literal("")),
  specialty: z.string().trim().optional().or(z.literal("")),
});

export type DentistFormValues = z.infer<typeof dentistFormSchema>;
