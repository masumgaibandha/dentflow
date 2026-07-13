import { z } from "zod";

export const clinicSettingsFormSchema = z.object({
  name: z.string().trim().min(2, "Clinic name is required"),
  address: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  timezone: z.string().trim().optional().or(z.literal("")),
});

export type ClinicSettingsFormValues = z.infer<typeof clinicSettingsFormSchema>;
