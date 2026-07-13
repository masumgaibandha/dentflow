"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  patientFormSchema,
  type PatientFormValues,
} from "@/validators/patient";

export function PatientForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: Partial<PatientFormValues>;
  onSubmit: (values: PatientFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  const dateOfBirthField = register("dateOfBirth");

  function openDatePicker() {
    try {
      dateInputRef.current?.showPicker();
    } catch {
      dateInputRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <FormField label="Name" error={errors.name?.message}>
        <input {...register("name")} className={inputClasses} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClasses} />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <input {...register("phone")} className={inputClasses} />
      </FormField>

      <FormField label="Date of birth" error={errors.dateOfBirth?.message}>
        <input
          type="date"
          {...dateOfBirthField}
          ref={(element) => {
            dateOfBirthField.ref(element);
            dateInputRef.current = element;
          }}
          onClick={openDatePicker}
          className={`${inputClasses} cursor-pointer`}
        />
      </FormField>

      <FormField label="Notes" error={errors.notes?.message}>
        <textarea {...register("notes")} rows={3} className={inputClasses} />
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
