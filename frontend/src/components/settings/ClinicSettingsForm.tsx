"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { TimezoneSelect } from "@/components/settings/TimezoneSelect";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from "@/lib/weekdays";
import {
  clinicSettingsFormSchema,
  type ClinicSettingsFormValues,
} from "@/validators/clinicSettings";

function openTimePicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker();
  } catch {
    input.focus();
  }
}

function DayHoursRow({
  day,
  register,
  isClosed,
  openTimeError,
  closeTimeError,
}: {
  day: Weekday;
  register: UseFormRegister<ClinicSettingsFormValues>;
  isClosed: boolean;
  openTimeError?: string;
  closeTimeError?: string;
}) {
  const openRef = useRef<HTMLInputElement | null>(null);
  const closeRef = useRef<HTMLInputElement | null>(null);
  const openField = register(`weeklyHours.${day}.openTime`);
  const closeField = register(`weeklyHours.${day}.closeTime`);

  return (
    <div className="flex flex-col gap-2 border-b border-zinc-200 py-3 last:border-b-0 dark:border-zinc-800 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <span className="w-24 shrink-0 text-sm font-medium">{WEEKDAY_LABELS[day]}</span>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register(`weeklyHours.${day}.isClosed`)}
          className="cursor-pointer"
        />
        Closed
      </label>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        <input
          type="time"
          disabled={isClosed}
          {...openField}
          ref={(element) => {
            openField.ref(element);
            openRef.current = element;
          }}
          onClick={() => openTimePicker(openRef.current)}
          className={`${inputClasses} ${isClosed ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        />
        <span className="text-zinc-400">to</span>
        <input
          type="time"
          disabled={isClosed}
          {...closeField}
          ref={(element) => {
            closeField.ref(element);
            closeRef.current = element;
          }}
          onClick={() => openTimePicker(closeRef.current)}
          className={`${inputClasses} ${isClosed ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        />
      </div>

      {(openTimeError || closeTimeError) && (
        <p className="w-full text-xs text-red-600">{openTimeError || closeTimeError}</p>
      )}
    </div>
  );
}

export function ClinicSettingsForm({
  defaultValues,
  slug,
  hoursConfigured,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: ClinicSettingsFormValues;
  slug?: string;
  hoursConfigured: boolean;
  onSubmit: (values: ClinicSettingsFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClinicSettingsFormValues>({
    resolver: zodResolver(clinicSettingsFormSchema),
    defaultValues,
  });

  const [timezone, setTimezone] = useState(defaultValues.timezone ?? "");
  const weeklyHours = watch("weeklyHours");

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

      <div>
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Weekly operating hours
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Patients can only book appointments within these hours.
        </p>

        {!hoursConfigured && (
          <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Operating hours have not been configured yet. Patient self-service booking is
            unavailable until you review and save hours below.
          </p>
        )}

        <div className="mt-3 rounded-lg border border-zinc-200 px-3 dark:border-zinc-800">
          {WEEKDAYS.map((day) => (
            <DayHoursRow
              key={day}
              day={day}
              register={register}
              isClosed={weeklyHours?.[day]?.isClosed ?? false}
              openTimeError={errors.weeklyHours?.[day]?.openTime?.message}
              closeTimeError={errors.weeklyHours?.[day]?.closeTime?.message}
            />
          ))}
        </div>
      </div>

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
