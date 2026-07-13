"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { dentistFormSchema, type DentistFormValues } from "@/validators/dentist";

export function DentistForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: Partial<DentistFormValues>;
  onSubmit: (values: DentistFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DentistFormValues>({
    resolver: zodResolver(dentistFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Name" error={errors.name?.message}>
        <input {...register("name")} className={inputClasses} />
      </FormField>
      <FormField label="Specialty" error={errors.specialty?.message}>
        <input {...register("specialty")} className={inputClasses} placeholder="e.g. Orthodontics" />
      </FormField>
      <FormField label="Email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClasses} />
      </FormField>
      <FormField label="Phone" error={errors.phone?.message}>
        <input {...register("phone")} className={inputClasses} />
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
