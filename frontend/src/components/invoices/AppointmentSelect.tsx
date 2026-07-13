"use client";

import { useState } from "react";
import { inputClasses } from "@/components/ui/FormField";
import { useMe } from "@/hooks/useAuth";
import { useAppointmentsList } from "@/hooks/useAppointments";
import type { Appointment } from "@/lib/api/appointmentsApi";

export function AppointmentSelect({
  patientId,
  selectedLabel,
  onSelect,
  onClear,
}: {
  patientId: string;
  selectedLabel: string;
  onSelect: (appointment: Appointment) => void;
  onClear: () => void;
}) {
  const { data: me } = useMe();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useAppointmentsList(
    { patientId, sortBy: "startTime", sortOrder: "desc", limit: 10 },
    patientId ? me?.clinic.id : undefined,
  );

  if (!patientId) {
    return (
      <p className={`${inputClasses} w-full cursor-not-allowed text-zinc-400`}>
        Select a patient first
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className={`${inputClasses} w-full text-left`}
        >
          {selectedLabel || "Link an appointment (optional)"}
        </button>
        {selectedLabel && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="rounded-md border border-zinc-300 px-2.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {isLoading && <div className="p-2 text-sm text-zinc-500">Loading...</div>}
          {!isLoading && (data?.data.length ?? 0) === 0 && (
            <div className="p-2 text-sm text-zinc-500">No appointments for this patient.</div>
          )}
          {!isLoading &&
            data?.data.map((appointment) => (
              <button
                type="button"
                key={appointment.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(appointment);
                  setIsOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {new Date(appointment.startTime).toLocaleString()}
                <span className="ml-2 text-xs text-zinc-500">
                  {appointment.dentist.name} · {appointment.status}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
