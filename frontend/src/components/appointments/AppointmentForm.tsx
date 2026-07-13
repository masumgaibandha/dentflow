"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { DentistSelect } from "@/components/appointments/DentistSelect";
import { PatientSelect } from "@/components/appointments/PatientSelect";
import { TreatmentSelect } from "@/components/appointments/TreatmentSelect";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { toDatetimeLocal } from "@/lib/datetimeLocal";
import {
  appointmentFormSchema,
  type AppointmentFormValues,
} from "@/validators/appointment";

export interface AppointmentFormDefaults extends Partial<AppointmentFormValues> {
  patientLabel?: string;
  dentistLabel?: string;
  treatmentLabel?: string;
}

export function AppointmentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  defaultValues?: AppointmentFormDefaults;
  onSubmit: (values: AppointmentFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const startTimeInputRef = useRef<HTMLInputElement | null>(null);
  const endTimeInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  const [patientLabel, setPatientLabel] = useState(
    defaultValues?.patientLabel ?? "",
  );
  const [dentistLabel, setDentistLabel] = useState(
    defaultValues?.dentistLabel ?? "",
  );
  const [treatmentLabel, setTreatmentLabel] = useState(
    defaultValues?.treatmentLabel ?? "",
  );

  const startTime = watch("startTime");

  const startTimeField = register("startTime");
  const endTimeField = register("endTime");

  function openDateTimePicker(input: HTMLInputElement | null) {
    if (!input) return;

    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <FormField label="Patient" error={errors.patientId?.message}>
        <PatientSelect
          selectedLabel={patientLabel}
          onSelect={(patient) => {
            setValue("patientId", patient.id, {
              shouldValidate: true,
            });
            setPatientLabel(patient.name);
          }}
        />
      </FormField>

      <FormField label="Dentist" error={errors.dentistId?.message}>
        <DentistSelect
          selectedLabel={dentistLabel}
          onSelect={(dentist) => {
            setValue("dentistId", dentist.id, {
              shouldValidate: true,
            });
            setDentistLabel(dentist.name);
          }}
        />
      </FormField>

      <FormField
        label="Treatment (optional)"
        error={errors.treatmentId?.message}
      >
        <TreatmentSelect
          selectedLabel={treatmentLabel}
          onSelect={(treatment) => {
            setValue("treatmentId", treatment.id, {
              shouldValidate: true,
            });
            setTreatmentLabel(treatment.title);

            if (startTime) {
              const prefillEnd = new Date(
                new Date(startTime).getTime() +
                  treatment.durationMinutes * 60_000,
              );

              setValue("endTime", toDatetimeLocal(prefillEnd), {
                shouldValidate: true,
              });
            }
          }}
          onClear={() => {
            setValue("treatmentId", "", {
              shouldValidate: true,
            });
            setTreatmentLabel("");
          }}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Start time" error={errors.startTime?.message}>
          <input
            type="datetime-local"
            {...startTimeField}
            ref={(element) => {
              startTimeField.ref(element);
              startTimeInputRef.current = element;
            }}
            onClick={() => openDateTimePicker(startTimeInputRef.current)}
            className={`${inputClasses} cursor-pointer`}
          />
        </FormField>

        <FormField label="End time" error={errors.endTime?.message}>
          <input
            type="datetime-local"
            {...endTimeField}
            ref={(element) => {
              endTimeField.ref(element);
              endTimeInputRef.current = element;
            }}
            onClick={() => openDateTimePicker(endTimeInputRef.current)}
            className={`${inputClasses} cursor-pointer`}
          />
        </FormField>
      </div>

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
