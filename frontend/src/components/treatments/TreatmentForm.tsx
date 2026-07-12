"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { TREATMENT_CATEGORIES } from "@/lib/api/treatmentsApi";
import { treatmentFormSchema, type TreatmentFormValues } from "@/validators/treatment";

export function TreatmentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: Partial<TreatmentFormValues>;
  onSubmit: (values: TreatmentFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Image URL" error={errors.imageUrl?.message}>
        <input {...register("imageUrl")} className={inputClasses} placeholder="https://..." />
      </FormField>
      <FormField label="Title" error={errors.title?.message}>
        <input {...register("title")} className={inputClasses} />
      </FormField>
      <FormField label="Short description" error={errors.shortDescription?.message}>
        <input {...register("shortDescription")} className={inputClasses} />
      </FormField>
      <FormField label="Full description" error={errors.fullDescription?.message}>
        <textarea {...register("fullDescription")} rows={4} className={inputClasses} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price (USD)" error={errors.price?.message}>
          <input type="number" step="0.01" {...register("price")} className={inputClasses} />
        </FormField>
        <FormField label="Duration (minutes)" error={errors.durationMinutes?.message}>
          <input type="number" {...register("durationMinutes")} className={inputClasses} />
        </FormField>
      </div>
      <FormField label="Category" error={errors.category?.message}>
        <select {...register("category")} className={inputClasses} defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {TREATMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
