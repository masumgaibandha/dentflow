"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useCreatePortalAppointment, usePortalDentists, usePortalTreatments } from "@/hooks/usePortal";
import { getErrorMessage } from "@/lib/errors";
import {
  portalAppointmentFormSchema,
  type PortalAppointmentFormValues,
} from "@/validators/portalAppointment";

// Dedicated patient booking component - built from scratch, not the admin
// AppointmentForm (which lets staff choose any patient, set status/notes,
// and pick endTime directly). This form only ever produces
// {dentistId, treatmentId, startTime} for the current patient; the server
// derives clinicId/patientId and computes endTime/status itself.

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

function openDateTimePicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker();
  } catch {
    input.focus();
  }
}

export function PortalAppointmentBookingForm({ onBooked }: { onBooked: () => void }) {
  const dentistsQuery = usePortalDentists();
  const treatmentsQuery = usePortalTreatments();
  const createAppointment = useCreatePortalAppointment();

  const startTimeInputRef = useRef<HTMLInputElement | null>(null);
  // Regenerated after every successful booking (and fresh on every mount,
  // e.g. modal reopen) - held only in memory, never written to
  // localStorage/sessionStorage, so it can't leak or persist across an
  // account switch.
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PortalAppointmentFormValues>({
    resolver: zodResolver(portalAppointmentFormSchema),
    defaultValues: { dentistId: "", treatmentId: "", startTime: "" },
  });

  const treatmentId = watch("treatmentId");
  const startTimeField = register("startTime");

  const selectedTreatment = useMemo(
    () => treatmentsQuery.data?.data.find((treatment) => treatment.id === treatmentId) ?? null,
    [treatmentsQuery.data, treatmentId],
  );

  async function onSubmit(values: PortalAppointmentFormValues) {
    try {
      await createAppointment.mutateAsync({
        input: {
          dentistId: values.dentistId,
          treatmentId: values.treatmentId,
          startTime: new Date(values.startTime).toISOString(),
        },
        idempotencyKey: idempotencyKeyRef.current,
      });
      idempotencyKeyRef.current = crypto.randomUUID();
      reset({ dentistId: "", treatmentId: "", startTime: "" });
      toast.success("Appointment booked successfully.");
      onBooked();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Dentist" error={errors.dentistId?.message}>
        <select {...register("dentistId")} className={`${inputClasses} cursor-pointer`}>
          <option value="">Select a dentist</option>
          {dentistsQuery.data?.data.map((dentist) => (
            <option key={dentist.id} value={dentist.id}>
              {dentist.name}
              {dentist.specialty ? ` — ${dentist.specialty}` : ""}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Treatment" error={errors.treatmentId?.message}>
        <select {...register("treatmentId")} className={`${inputClasses} cursor-pointer`}>
          <option value="">Select a treatment</option>
          {treatmentsQuery.data?.data.map((treatment) => (
            <option key={treatment.id} value={treatment.id}>
              {treatment.title}
            </option>
          ))}
        </select>
      </FormField>

      {selectedTreatment && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Duration: {formatDuration(selectedTreatment.durationMinutes)}
        </p>
      )}

      <FormField label="Date and time" error={errors.startTime?.message}>
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Booking..." : "Book appointment"}
      </button>
    </form>
  );
}
