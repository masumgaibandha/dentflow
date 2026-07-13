"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TimezoneSelect } from "@/components/settings/TimezoneSelect";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  clinicSettingsFormSchema,
  type ClinicSettingsFormValues,
} from "@/validators/clinicSettings";

export function ClinicSettingsForm({
  defaultValues,
  slug,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: ClinicSettingsFormValues;
  slug?: string;
  onSubmit: (values: ClinicSettingsFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClinicSettingsFormValues>({
    resolver: zodResolver(clinicSettingsFormSchema),
    defaultValues,
  });

  const [timezone, setTimezone] = useState(defaultValues.timezone ?? "");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {slug && (
        <FormField label="Public catalog slug (fixed)">
          <p className={`${inputClasses} cursor-not-allowed text-zinc-500`}>{slug}</p>
        </FormField>
      )}

      <FormField label="Clinic name" error={errors.name?.message}>
        <input {...register("name")} className={inputClasses} />
      </FormField>

      <FormField label="Address" error={errors.address?.message}>
        <input {...register("address")} className={inputClasses} />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <input {...register("phone")} className={inputClasses} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClasses} />
      </FormField>

      <FormField label="Timezone" error={errors.timezone?.message}>
        <TimezoneSelect
          value={timezone}
          onChange={(tz) => {
            setTimezone(tz);
            setValue("timezone", tz, { shouldValidate: true });
          }}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
