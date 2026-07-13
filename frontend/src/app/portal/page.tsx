"use client";

import { useState } from "react";
import { PortalAppointmentsTable } from "@/components/portal/PortalAppointmentsTable";
import { Pagination } from "@/components/ui/Pagination";
import { usePortalAppointments, usePortalMe } from "@/hooks/usePortal";

type Tab = "upcoming" | "past";

export default function PortalHomePage() {
  const { data, isLoading, isError, refetch } = usePortalMe();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [page, setPage] = useState(1);

  const {
    data: appointmentsData,
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    refetch: refetchAppointments,
  } = usePortalAppointments({ when: tab, page, limit: 10 });

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab);
    setPage(1);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-7 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          Something went wrong loading your portal.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {data.name}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        This is your patient portal at {data.clinic.name}.
      </p>

      <div className="mt-6 max-w-md rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Your details</h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Name</dt>
            <dd>{data.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Contact email</dt>
            <dd>{data.email || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Phone</dt>
            <dd>{data.phone || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Date of birth</dt>
            <dd>{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Portal login email</dt>
            <dd>{data.portalEmail}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your appointments</h2>

        <div
          role="tablist"
          aria-label="Appointment time frame"
          className="mt-3 flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
        >
          {(["upcoming", "past"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => handleTabChange(value)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                tab === value
                  ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {isAppointmentsError ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">
                Something went wrong loading your appointments.
              </p>
              <button
                type="button"
                onClick={() => refetchAppointments()}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <PortalAppointmentsTable
                appointments={appointmentsData?.data ?? []}
                isLoading={isAppointmentsLoading}
                emptyMessage={
                  tab === "upcoming" ? "No upcoming appointments" : "No past appointments"
                }
              />
              {appointmentsData && (
                <Pagination
                  page={appointmentsData.pagination.page}
                  totalPages={appointmentsData.pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
