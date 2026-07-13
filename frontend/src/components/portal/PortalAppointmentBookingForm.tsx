"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useCreatePortalAppointment, usePortalAvailableSlots, usePortalDentists, usePortalTreatments } from "@/hooks/usePortal";
import { ApiClientError } from "@/lib/api/client";
import type { AvailableSlot } from "@/lib/api/portalApi";
import { getErrorMessage } from "@/lib/errors";
import {
  portalAppointmentFormSchema,
  type PortalAppointmentFormValues,
} from "@/validators/portalAppointment";

// Dedicated patient booking component - built from scratch, not the admin
// AppointmentForm (which lets staff choose any patient, set status/notes,
// and pick any start/end time directly). This form only ever produces
// {dentistId, treatmentId, startTime} for the current patient, and startTime
// is always the exact value of a slot the server itself offered - never a
// freeform date/time reconstructed on the client.

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function openDatePicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker();
  } catch {
    input.focus();
  }
}

// Browser-local "today" - only a soft UX hint for the calendar's minimum
// selectable date. Not authoritative: the clinic's own local "today" (used
// by the server to decide what's actually bookable) may differ near
// midnight, and every date is re-validated server-side regardless.
function todayDateString(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function PortalAppointmentBookingForm({ onBooked }: { onBooked: () => void }) {
  const dentistsQuery = usePortalDentists();
  const treatmentsQuery = usePortalTreatments();
  const createAppointment = useCreatePortalAppointment();

  const dateInputRef = useRef<HTMLInputElement | null>(null);
  // Regenerated after every successful booking (and fresh on every mount,
  // e.g. modal reopen) - held only in memory, never written to
  // localStorage/sessionStorage, so it can't leak or persist across an
  // account switch.
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PortalAppointmentFormValues>({
    resolver: zodResolver(portalAppointmentFormSchema),
    defaultValues: { dentistId: "", treatmentId: "", date: "" },
  });

  const dentistId = watch("dentistId");
  const treatmentId = watch("treatmentId");
  const date = watch("date");
  const dateField = register("date");

  const slotsQuery = usePortalAvailableSlots(dentistId, treatmentId, date);

  // A slot fetched for one dentist/treatment/date combination must never
  // stay selected once any of those three change - it may no longer even be
  // in the new slot list.
  useEffect(() => {
    setSelectedSlot(null);
  }, [dentistId, treatmentId, date]);

  const selectedTreatment = useMemo(
    () => treatmentsQuery.data?.data.find((treatment) => treatment.id === treatmentId) ?? null,
    [treatmentsQuery.data, treatmentId],
  );

  async function onSubmit() {
    if (!selectedSlot) {
      toast.error("Please select an available time.");
      return;
    }
    try {
      await createAppointment.mutateAsync({
        input: {
          dentistId,
          treatmentId,
          startTime: selectedSlot.startTime,
        },
        idempotencyKey: idempotencyKeyRef.current,
      });
      idempotencyKeyRef.current = crypto.randomUUID();
      reset({ dentistId: "", treatmentId: "", date: "" });
      setSelectedSlot(null);
      toast.success("Appointment booked successfully.");
      onBooked();
    } catch (error) {
      // A slot the patient saw a moment ago can vanish between fetch and
      // submit (someone else booked it, or it fell outside clinic hours
      // after a settings change) - the server always re-validates
      // regardless of what the UI last showed.
      setSelectedSlot(null);
      toast.error(getErrorMessage(error));
    }
  }

  function renderSlotsState() {
    if (!dentistId || !treatmentId || !date) {
      return (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Choose a dentist, treatment, and date to see available times.
        </p>
      );
    }

    if (slotsQuery.isLoading) {
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      );
    }

    if (slotsQuery.isError) {
      const error = slotsQuery.error;
      if (error instanceof ApiClientError && error.code === "CLINIC_HOURS_NOT_CONFIGURED") {
        return (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            This clinic hasn&apos;t configured its operating hours yet - online booking isn&apos;t
            available. Please contact the clinic directly.
          </p>
        );
      }
      if (error instanceof ApiClientError && error.code === "CLINIC_TIMEZONE_NOT_CONFIGURED") {
        return (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            This clinic hasn&apos;t configured its timezone yet - online booking isn&apos;t
            available. Please contact the clinic directly.
          </p>
        );
      }
      return (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            Something went wrong loading available times.
          </p>
          <button
            type="button"
            onClick={() => slotsQuery.refetch()}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!slotsQuery.data) return null;

    if (slotsQuery.data.isClosed) {
      return (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          The clinic is closed on the selected day.
        </p>
      );
    }

    if (slotsQuery.data.slots.length === 0) {
      return (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No available times on the selected day.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Times shown in your local time · clinic timezone: {slotsQuery.data.timezone}
        </p>
        <div className="flex flex-wrap gap-2">
          {slotsQuery.data.slots.map((slot) => (
            <button
              key={slot.startTime}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                selectedSlot?.startTime === slot.startTime
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              }`}
            >
              {formatSlotTime(slot.startTime)}
            </button>
          ))}
        </div>
      </div>
    );
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

      <FormField label="Date" error={errors.date?.message}>
        <input
          type="date"
          min={todayDateString()}
          {...dateField}
          ref={(element) => {
            dateField.ref(element);
            dateInputRef.current = element;
          }}
          onClick={() => openDatePicker(dateInputRef.current)}
          className={`${inputClasses} cursor-pointer`}
        />
      </FormField>

      <FormField label="Available times">{renderSlotsState()}</FormField>

      <button
        type="submit"
        disabled={isSubmitting || !selectedSlot}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Booking..." : "Book appointment"}
      </button>
    </form>
  );
}
