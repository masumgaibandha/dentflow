import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
