import { z } from "zod";
import { TREATMENT_CATEGORIES } from "../../models/Treatment";

// Local paths (e.g. /services/dental-cleaning.svg, matching the seeded demo
// catalog and the frontend's own fallback asset) and absolute http(s) URLs
// are both valid; anything else is rejected.
function isValidImageRef(value: string): boolean {
  if (value.startsWith("/")) {
    return !value.startsWith("//") && value.length > 1;
  }
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const treatmentInputSchema = z.object({
  // Optional: empty/whitespace-only input normalizes to no image, which the
  // frontend's TreatmentImage component renders as a local fallback.
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || isValidImageRef(value), {
      message: "Enter a valid image URL or local path (e.g. /services/example.svg)",
    }),
  title: z.string().trim().min(2, "Title is required"),
  shortDescription: z.string().trim().min(10, "Short description is required"),
  fullDescription: z.string().trim().min(20, "Full description is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  category: z.enum(TREATMENT_CATEGORIES),
  // Not surfaced in the admin UI yet - controls whether the patient portal's
  // booking lookup (GET /api/portal/treatments) includes this treatment.
  isActive: z.boolean().optional(),
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
