import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5_000, "Message is too long"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
