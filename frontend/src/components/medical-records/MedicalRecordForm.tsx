"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { DentistSelect } from "@/components/appointments/DentistSelect";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useAppointmentsList } from "@/hooks/useAppointments";
import { useMe } from "@/hooks/useAuth";
import { MEDICAL_RECORD_TYPES, type MedicalRecordType } from "@/lib/api/medicalRecordsApi";
import {
  medicalRecordFormSchema,
  type MedicalRecordFormValues,
} from "@/validators/medicalRecord";

const RECORD_TYPE_LABELS: Record<MedicalRecordType, string> = {
  consultation: "Consultation",
  diagnosis: "Diagnosis",
  procedure_note: "Procedure note",
  follow_up: "Follow-up",
  other: "Other",
};

export interface MedicalRecordFormDefaults extends Partial<MedicalRecordFormValues> {
  dentistLabel?: string;
}

export function MedicalRecordForm({
  patientId,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  patientId: string;
  defaultValues?: MedicalRecordFormDefaults;
  onSubmit: (values: MedicalRecordFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const { data: me } = useMe();
  const recordDateInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      recordType: defaultValues?.recordType ?? "consultation",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      recordDate: defaultValues?.recordDate ?? "",
      appointmentId: defaultValues?.appointmentId ?? "",
      attendingDentistId: defaultValues?.attendingDentistId ?? "",
    },
  });

  const [dentistLabel, setDentistLabel] = useState(defaultValues?.dentistLabel ?? "");

  const { data: appointmentsData } = useAppointmentsList(
    { patientId, sortBy: "startTime", sortOrder: "desc", limit: 50 },
    me?.clinic.id,
  );

  const recordDateField = register("recordDate");

  function openDateTimePicker(input: HTMLInputElement | null) {
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Record type" error={errors.recordType?.message}>
        <select {...register("recordType")} className={inputClasses}>
          {MEDICAL_RECORD_TYPES.map((type) => (
            <option key={type} value={type}>
              {RECORD_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Title" error={errors.title?.message}>
        <input type="text" {...register("title")} className={inputClasses} maxLength={200} />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={6}
          maxLength={10_000}
          placeholder="Plain text clinical notes only - no formatting."
          className={inputClasses}
        />
      </FormField>

      <FormField label="Record date (optional - defaults to now)" error={errors.recordDate?.message}>
        <input
          type="datetime-local"
          {...recordDateField}
          ref={(element) => {
            recordDateField.ref(element);
            recordDateInputRef.current = element;
          }}
          onClick={() => openDateTimePicker(recordDateInputRef.current)}
          className={`${inputClasses} cursor-pointer`}
        />
      </FormField>

      <FormField label="Linked appointment (optional)" error={errors.appointmentId?.message}>
        <select {...register("appointmentId")} className={inputClasses}>
          <option value="">None</option>
          {appointmentsData?.data.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {new Date(appointment.startTime).toLocaleString()} — {appointment.status}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Attending dentist (optional)" error={errors.attendingDentistId?.message}>
        <DentistSelect
          selectedLabel={dentistLabel}
          onSelect={(dentist) => {
            setValue("attendingDentistId", dentist.id, { shouldValidate: true });
            setDentistLabel(dentist.name);
          }}
        />
        {dentistLabel && (
          <button
            type="button"
            onClick={() => {
              setValue("attendingDentistId", "", { shouldValidate: true });
              setDentistLabel("");
            }}
            className="mt-1 self-start text-xs text-zinc-500 hover:underline"
          >
            Clear dentist
          </button>
        )}
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

export function toMedicalRecordInput(values: MedicalRecordFormValues) {
  return {
    recordType: values.recordType,
    title: values.title,
    description: values.description,
    recordDate: values.recordDate ? new Date(values.recordDate).toISOString() : undefined,
    appointmentId: values.appointmentId || undefined,
    attendingDentistId: values.attendingDentistId || undefined,
  };
}
