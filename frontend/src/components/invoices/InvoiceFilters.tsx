"use client";

import { useRef } from "react";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/api/invoicesApi";

export interface InvoiceFiltersValue {
  status: InvoiceStatus | "";
  dateFrom: string;
  dateTo: string;
}

const selectClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const dateInputClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker();
  } catch {
    input.focus();
  }
}

export function InvoiceFilters({
  value,
  onChange,
}: {
  value: InvoiceFiltersValue;
  onChange: (value: InvoiceFiltersValue) => void;
}) {
  const dateFromRef = useRef<HTMLInputElement | null>(null);
  const dateToRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        From (created)
        <input
          type="date"
          ref={dateFromRef}
          value={value.dateFrom}
          onClick={() => openPicker(dateFromRef.current)}
          onChange={(event) => onChange({ ...value, dateFrom: event.target.value })}
          className={`${dateInputClasses} cursor-pointer`}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        To (created)
        <input
          type="date"
          ref={dateToRef}
          value={value.dateTo}
          onClick={() => openPicker(dateToRef.current)}
          onChange={(event) => onChange({ ...value, dateTo: event.target.value })}
          className={`${dateInputClasses} cursor-pointer`}
        />
      </label>
      <select
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as InvoiceStatus | "" })}
        className={selectClasses}
      >
        <option value="">All statuses</option>
        {INVOICE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
