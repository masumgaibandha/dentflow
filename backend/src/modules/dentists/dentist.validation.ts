import { z } from "zod";

export const dentistInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone is required").optional().or(z.literal("")),
  specialty: z.string().trim().optional().or(z.literal("")),
});

export type DentistInput = z.infer<typeof dentistInputSchema>;

export const updateDentistSchema = dentistInputSchema.partial();

export type UpdateDentistInput = z.infer<typeof updateDentistSchema>;

export const listDentistsQuerySchema = z.object({
  search: z.string().trim().optional(),
  sortBy: z.enum(["name", "newest"]).default("newest"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListDentistsQuery = z.infer<typeof listDentistsQuerySchema>;
