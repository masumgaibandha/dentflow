"use client";

import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";
import { useMe } from "@/hooks/useAuth";
import { useDashboardSummary } from "@/hooks/useDashboard";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data, isLoading, isError, refetch } = useDashboardSummary(me?.clinic.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome back{me ? `, ${me.user.name}` : ""}
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        You&apos;re signed in as {me?.user.role} at {me?.clinic.name}.
      </p>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400">
            Something went wrong loading the dashboard.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {isLoading || !data ? (
              Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard label="Total patients" value={String(data.totals.patients)} />
                <StatCard label="Total dentists" value={String(data.totals.dentists)} />
                <StatCard label="Active services" value={String(data.totals.activeTreatments)} />
                <StatCard label="Today's appointments" value={String(data.appointments.today)} />
                <StatCard label="Upcoming appointments" value={String(data.appointments.upcoming)} />
                <StatCard label="Unpaid invoices" value={String(data.invoices.unpaidCount)} />
                <StatCard
                  label="Outstanding amount"
                  value={formatCents(data.invoices.outstandingCents)}
                />
                <StatCard
                  label="Paid revenue this month"
                  value={formatCents(data.invoices.paidRevenueThisMonthCents)}
                />
              </>
            )}
          </div>

          <div className="mt-6">
            {isLoading || !data ? (
              <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ) : (
              <RevenueChart label={data.chart.label} days={data.chart.days} />
            )}
          </div>

          {!isLoading &&
            data &&
            data.totals.patients === 0 &&
            data.totals.dentists === 0 &&
            data.appointments.today === 0 &&
            data.appointments.upcoming === 0 && (
              <div className="mt-6 rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
                Your clinic is empty so far. Start by{" "}
                <Link href="/patients" className="underline">
                  adding a patient
                </Link>{" "}
                or{" "}
                <Link href="/dentists" className="underline">
                  a dentist
                </Link>
                .
              </div>
            )}
        </>
      )}
    </div>
  );
}
