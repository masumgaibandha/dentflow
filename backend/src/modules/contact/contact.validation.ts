import { z } from "zod";

// .strict() rejects any unexpected field outright (400) rather than silently
// dropping it - this is a public, unauthenticated endpoint, so the body is
// the only thing we trust at all, and it must be exactly these four fields.
export const createContactMessageSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(254, "Email is too long"),
    subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(5_000, "Message is too long"),
  })
  .strict();

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
