import type { Weekday } from "../models/Clinic";

// Timezone rule for all dashboard date-boundary calculations: use the
// clinic's own IANA timezone when it has one set (see /api/clinics/me),
// otherwise fall back to this documented default - never a hardcoded
// specific clinic's timezone.
export const DEFAULT_TIMEZONE = "UTC";

/**
 * Validates an IANA timezone name in a runtime-compatible way. Prefers the
 * exact `Intl.supportedValuesOf("timeZone")` allowlist when the runtime
 * supports it (Node 18+), falling back to the `Intl.DateTimeFormat`
 * try/catch technique (which throws RangeError for an unrecognized zone)
 * everywhere else.
 */
export function isValidTimezone(timezone: string): boolean {
  const supportedValuesOf = (
    Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
  ).supportedValuesOf;

  if (typeof supportedValuesOf === "function") {
    try {
      return supportedValuesOf("timeZone").includes(timezone);
    } catch {
      // Fall through to the try/catch check below.
    }
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the UTC instants corresponding to local midnight at the start and
 * end of the calendar day containing `date`, as observed in `timeZone`.
 *
 * Implementation note: computes the UTC offset for `timeZone` at the given
 * instant via the toLocaleString round-trip technique, so it stays correct
 * across DST transitions without a date-time library dependency.
 */
export function getDayRange(date: Date, timeZone: string): { start: Date; end: Date } {
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const start = applyTimezoneOffset(new Date(`${dateStr}T00:00:00.000Z`), date, timeZone);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Returns the UTC instants corresponding to local midnight on the 1st of the
 * calendar month containing `date` (start) and the 1st of the following
 * month (end), as observed in `timeZone`.
 */
export function getMonthRange(date: Date, timeZone: string): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;

  const start = applyTimezoneOffset(new Date(`${year}-${month}-01T00:00:00.000Z`), date, timeZone);

  const nextMonthDate = new Date(Date.UTC(Number(year), Number(month), 1));
  const nextParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(nextMonthDate);
  const nextYear = nextParts.find((p) => p.type === "year")!.value;
  const nextMonth = nextParts.find((p) => p.type === "month")!.value;
  const end = applyTimezoneOffset(
    new Date(`${nextYear}-${nextMonth}-01T00:00:00.000Z`),
    date,
    timeZone,
  );

  return { start, end };
}

/**
 * Returns the calendar-date string (YYYY-MM-DD) for `date` as observed in
 * `timeZone` - used to label chart day-buckets consistently with MongoDB's
 * own `$dateToString` timezone conversion.
 */
export function toTimezoneDateString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Shifts a "naive" UTC-labelled instant (constructed from a Y-M-D string as
// if it were UTC) by the actual UTC offset of `timeZone` at `referenceInstant`,
// producing the real UTC instant for local midnight on that calendar date.
function applyTimezoneOffset(naiveUtc: Date, referenceInstant: Date, timeZone: string): Date {
  const asTimezoneWallClock = new Date(
    referenceInstant.toLocaleString("en-US", { timeZone }),
  );
  const asUtcWallClock = new Date(referenceInstant.toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetMs = asTimezoneWallClock.getTime() - asUtcWallClock.getTime();
  return new Date(naiveUtc.getTime() - offsetMs);
}

/**
 * Converts a clinic-local calendar date ("YYYY-MM-DD") and wall-clock time
 * ("HH:mm") into the absolute UTC instant they represent in `timeZone`,
 * reusing the same Intl-based offset technique as getDayRange/getMonthRange
 * above - no external timezone library needed, and correct across DST
 * transitions because the offset is sampled at the specific instant being
 * converted (via the naive value itself as the reference), not at "now".
 */
export function zonedDateTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const naiveUtc = new Date(`${dateStr}T${timeStr}:00.000Z`);
  return applyTimezoneOffset(naiveUtc, naiveUtc, timeZone);
}

/**
 * Returns the day-of-week key (WEEKDAYS in models/Clinic.ts) for a plain
 * "YYYY-MM-DD" calendar date string. Deliberately timezone-independent: the
 * string already represents a specific clinic-local calendar date, so it is
 * parsed as if it were UTC purely to extract the weekday - no conversion.
 */
const WEEKDAY_BY_UTC_DAY: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function weekdayOfDateString(dateStr: string): Weekday {
  const utcDay = new Date(`${dateStr}T00:00:00.000Z`).getUTCDay();
  const weekday = WEEKDAY_BY_UTC_DAY[utcDay];
  if (!weekday) {
    throw new Error(`Unexpected getUTCDay() value: ${utcDay}`);
  }
  return weekday;
}
