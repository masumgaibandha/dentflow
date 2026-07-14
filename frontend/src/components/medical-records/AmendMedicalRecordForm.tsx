"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { amendmentFormSchema, type AmendmentFormValues } from "@/validators/medicalRecord";

export function AmendMedicalRecordForm({
  originalTitle,
  onSubmit,
  isSubmitting,
}: {
  originalTitle: string;
  onSubmit: (values: AmendmentFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmendmentFormValues>({
    resolver: zodResolver(amendmentFormSchema),
    defaultValues: { title: "", description: "", amendmentReason: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This adds a new, separate amendment to &ldquo;{originalTitle}&rdquo;. The original record is
        never changed or overwritten.
      </p>

      <FormField label="Amendment title" error={errors.title?.message}>
        <input type="text" {...register("title")} className={inputClasses} maxLength={200} />
      </FormField>

      <FormField label="Correction / additional clinical text" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={5}
          maxLength={10_000}
          placeholder="Plain text only - no formatting."
          className={inputClasses}
        />
      </FormField>

      <FormField label="Reason for this amendment" error={errors.amendmentReason?.message}>
        <textarea
          {...register("amendmentReason")}
          rows={2}
          maxLength={500}
          placeholder="Why is this correction being added?"
          className={inputClasses}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving..." : "Add amendment"}
      </button>
    </form>
  );
}
