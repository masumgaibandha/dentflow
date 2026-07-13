"use client";

import { useMemo, useState } from "react";
import { inputClasses } from "@/components/ui/FormField";

// Used only if the browser doesn't support Intl.supportedValuesOf (older
// Safari/browsers) - a representative spread of major IANA zones so the
// selector still works, just with a shorter searchable list.
const FALLBACK_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function getAllTimezones(): string[] {
  const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf;

  if (typeof supportedValuesOf === "function") {
    try {
      return supportedValuesOf("timeZone");
    } catch {
      // fall through to the static list below
    }
  }

  return FALLBACK_TIMEZONES;
}

export function TimezoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (timezone: string) => void;
}) {
  const allTimezones = useMemo(() => getAllTimezones(), []);
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return allTimezones.slice(0, 20);
    const lower = query.toLowerCase();
    return allTimezones.filter((tz) => tz.toLowerCase().includes(lower)).slice(0, 20);
  }, [allTimezones, query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder="Search timezone (e.g. America/New_York)..."
        className={`${inputClasses} w-full`}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.length === 0 && (
            <div className="p-2 text-sm text-zinc-500">No matching timezones.</div>
          )}
          {filtered.map((tz) => (
            <button
              type="button"
              key={tz}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(tz);
                setQuery(tz);
                setIsOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {tz.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
