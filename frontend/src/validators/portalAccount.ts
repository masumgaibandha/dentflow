import { z } from "zod";

export const createPortalAccountFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  initialPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreatePortalAccountFormValues = z.infer<typeof createPortalAccountFormSchema>;
