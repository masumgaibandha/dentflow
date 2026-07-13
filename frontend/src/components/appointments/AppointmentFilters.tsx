"use client";

import { useMe } from "@/hooks/useAuth";
import { useDentistsList } from "@/hooks/useDentists";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/api/appointmentsApi";

export interface AppointmentFiltersValue {
  dateFrom: string;
  dateTo: string;
  dentistId: string;
  status: AppointmentStatus | "";
}

const selectClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const dateInputClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function AppointmentFilters({
  value,
  onChange,
}: {
  value: AppointmentFiltersValue;
  onChange: (value: AppointmentFiltersValue) => void;
}) {
  const { data: me } = useMe();
  const { data: dentists } = useDentistsList(
    { sortBy: "name", sortOrder: "asc", limit: 50 },
    me?.clinic.id,
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        From
        <input
          type="date"
          value={value.dateFrom}
          onChange={(event) => onChange({ ...value, dateFrom: event.target.value })}
          className={dateInputClasses}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        To
        <input
          type="date"
          value={value.dateTo}
          onChange={(event) => onChange({ ...value, dateTo: event.target.value })}
          className={dateInputClasses}
        />
      </label>
      <select
        value={value.dentistId}
        onChange={(event) => onChange({ ...value, dentistId: event.target.value })}
        className={selectClasses}
      >
        <option value="">All dentists</option>
        {dentists?.data.map((dentist) => (
          <option key={dentist.id} value={dentist.id}>
            {dentist.name}
          </option>
        ))}
      </select>
      <select
        value={value.status}
        onChange={(event) =>
          onChange({ ...value, status: event.target.value as AppointmentStatus | "" })
        }
        className={selectClasses}
      >
        <option value="">All statuses</option>
        {APPOINTMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
