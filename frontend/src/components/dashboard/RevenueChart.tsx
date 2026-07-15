"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

interface RevenueChartDatum {
  date: string;
  label: string;
  amountDollars: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RevenueChartDatum }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{datum.label}</p>
      <p className="text-muted-foreground">${datum.amountDollars.toFixed(2)}</p>
    </div>
  );
}

export function RevenueChart({ label, days }: { label: string; days: DashboardChartDay[] }) {
  const total = days.reduce((sum, day) => sum + day.totalCents, 0);

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

  const chartData: RevenueChartDatum[] = days.map((day) => ({
    date: day.date,
    label: formatDayLabel(day.date),
    amountDollars: day.totalCents / 100,
  }));

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} <span className="font-normal text-zinc-500">· Total {formatCents(total)}</span>
      </p>

      <div
        role="img"
        aria-label={`${label}. Total ${formatCents(total)}. ${days
          .map((day) => `${formatDayLabel(day.date)}: ${formatCents(day.totalCents)}`)
          .join(", ")}.`}
        className="mt-4 h-56 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ className: "stroke-zinc-300 dark:stroke-zinc-700" }}
              className="fill-zinc-500 dark:fill-zinc-400"
            />
            <YAxis
              tickFormatter={(value: number) => `$${value}`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              className="fill-zinc-500 dark:fill-zinc-400"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(15, 76, 129, 0.08)" }} />
            <Bar dataKey="amountDollars" name="Paid revenue" fill="#0f4c81" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
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
