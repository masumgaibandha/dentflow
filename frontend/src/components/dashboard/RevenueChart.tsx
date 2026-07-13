import type { DashboardChartDay } from "@/lib/api/dashboardApi";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDayLabel(dateStr: string): string {
  // dateStr is YYYY-MM-DD in the clinic's timezone (see backend/src/utils/timezone.ts).
  // Parsed as UTC noon purely to render a stable weekday/day label - never used
  // for range comparisons, so it can't drift a day across the reader's own timezone.
  const date = new Date(`${dateStr}T12:00:00Z`);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", timeZone: "UTC" });
}

export function RevenueChart({ label, days }: { label: string; days: DashboardChartDay[] }) {
  const total = days.reduce((sum, day) => sum + day.totalCents, 0);
  const max = Math.max(...days.map((day) => day.totalCents), 0);

  if (total === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
        <div className="mt-6 flex h-40 items-center justify-center text-sm text-zinc-500">
          No paid revenue in this period yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>

      <div
        role="img"
        aria-label={`${label}. Total ${formatCents(total)}. ${days
          .map((day) => `${formatDayLabel(day.date)}: ${formatCents(day.totalCents)}`)
          .join(", ")}.`}
        className="mt-6 flex h-40 items-end justify-between gap-2"
      >
        {days.map((day) => {
          const heightPct = max > 0 ? Math.max((day.totalCents / max) * 100, day.totalCents > 0 ? 4 : 0) : 0;
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {day.totalCents > 0 ? formatCents(day.totalCents) : ""}
              </span>
              <div className="flex h-28 w-full items-end">
                <div
                  className="w-full max-w-6 mx-auto rounded-t bg-blue-500 dark:bg-blue-400"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {formatDayLabel(day.date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Screen-reader-friendly data summary, mirroring the aria-label above as a real table. */}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid revenue</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{day.date}</td>
              <td>{formatCents(day.totalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
