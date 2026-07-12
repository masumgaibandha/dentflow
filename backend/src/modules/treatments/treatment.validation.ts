import { z } from "zod";
import { TREATMENT_CATEGORIES } from "../../models/Treatment";

export const treatmentInputSchema = z.object({
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  title: z.string().trim().min(2, "Title is required"),
  shortDescription: z.string().trim().min(10, "Short description is required"),
  fullDescription: z.string().trim().min(20, "Full description is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  category: z.enum(TREATMENT_CATEGORIES),
});

export type TreatmentInput = z.infer<typeof treatmentInputSchema>;

export const updateTreatmentSchema = treatmentInputSchema.partial();

export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;

export const listTreatmentsQuerySchema = z.object({
  clinic: z.string().trim().optional(),
  search: z.string().trim().optional(),
  category: z.enum(TREATMENT_CATEGORIES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["price", "title", "newest"]).default("newest"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListTreatmentsQuery = z.infer<typeof listTreatmentsQuerySchema>;
