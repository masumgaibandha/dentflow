// Timezone rule for all dashboard date-boundary calculations: use the
// clinic's own IANA timezone when it has one set. Clinics have no settings
// UI yet to set this, so in practice every clinic currently falls back to
// this documented default - never a specific clinic's timezone.
export const DEFAULT_TIMEZONE = "UTC";

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
