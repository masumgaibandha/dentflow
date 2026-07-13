"use client";

import { useState } from "react";
import { PortalAppointmentBookingForm } from "@/components/portal/PortalAppointmentBookingForm";
import { PortalAppointmentsList } from "@/components/portal/PortalAppointmentsList";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { usePortalAppointments } from "@/hooks/usePortal";

type Tab = "upcoming" | "past";

export default function PortalAppointmentsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [page, setPage] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const { data, isLoading, isError, refetch } = usePortalAppointments({
    when: tab,
    page,
    limit: 10,
  });

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab);
    setPage(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your appointments</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Book a new appointment or cancel an upcoming one.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsBooking(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Book appointment
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Appointment time frame"
        className="mt-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
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
        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              Something went wrong loading your appointments.
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
            <PortalAppointmentsList
              appointments={data?.data ?? []}
              isLoading={isLoading}
              emptyMessage={tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
            />
            {data && (
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      <Modal open={isBooking} title="Book appointment" onClose={() => setIsBooking(false)}>
        <PortalAppointmentBookingForm
          onBooked={() => {
            setIsBooking(false);
            setTab("upcoming");
            setPage(1);
          }}
        />
      </Modal>
    </div>
  );
}
