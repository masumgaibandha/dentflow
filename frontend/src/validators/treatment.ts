import { z } from "zod";
import { TREATMENT_CATEGORIES } from "@/lib/api/treatmentsApi";

// Local paths (e.g. /services/dental-cleaning.svg, matching the seeded demo
// catalog and TreatmentImage's own fallback asset) and absolute http(s) URLs
// are both valid; anything else is rejected. Mirrors the backend's
// treatment.validation.ts - kept in sync manually since frontend/backend
// don't share a validation package.
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

export const treatmentFormSchema = z.object({
  // Optional: empty/whitespace-only input normalizes to no image, which
  // TreatmentImage renders as a local fallback illustration.
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
});

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
