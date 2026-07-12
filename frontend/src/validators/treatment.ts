import { z } from "zod";
import { TREATMENT_CATEGORIES } from "@/lib/api/treatmentsApi";

export const treatmentFormSchema = z.object({
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  title: z.string().trim().min(2, "Title is required"),
  shortDescription: z.string().trim().min(10, "Short description is required"),
  fullDescription: z.string().trim().min(20, "Full description is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  category: z.enum(TREATMENT_CATEGORIES),
});

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
