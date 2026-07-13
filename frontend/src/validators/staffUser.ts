import { z } from "zod";

export const createStaffFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateStaffFormValues = z.infer<typeof createStaffFormSchema>;
