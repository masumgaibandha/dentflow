import { PortalCancelAppointmentButton } from "@/components/portal/PortalCancelAppointmentButton";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PortalAppointment } from "@/lib/api/portalApi";

// Dedicated component for the /portal/appointments page - separate from the
// read-only PortalAppointmentsTable shown on the /portal dashboard, which
// must stay summary-only. This is the only patient-facing appointments view
// with a Cancel action, and it never gets an edit/reschedule/delete control.

function PortalAppointmentRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-16" />
      </td>
    </tr>
  );
}

const STATUS_BADGE_CLASSES: Record<PortalAppointment["status"], string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// Mirrors the server's own cancel-eligibility rule (status scheduled and
// startTime in the future) purely for whether to show the button - the
// server re-checks this atomically regardless of what the UI decides here.
function isCancellable(appointment: PortalAppointment): boolean {
  return appointment.status === "scheduled" && new Date(appointment.startTime).getTime() > Date.now();
}

export function PortalAppointmentsList({
  appointments,
  isLoading,
  emptyMessage,
}: {
  appointments: PortalAppointment[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[620px] text-left text-sm">
        <caption className="sr-only">Your appointments</caption>
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th scope="col" className="p-3">
              Date &amp; time
            </th>
            <th scope="col" className="p-3">
              Dentist
            </th>
            <th scope="col" className="p-3">
              Treatment
            </th>
            <th scope="col" className="p-3">
              Status
            </th>
            <th scope="col" className="p-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <PortalAppointmentRowSkeleton key={i} />)}

          {!isLoading && appointments.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="p-3 font-medium">
                  {formatDate(appointment.startTime)}
                  <div className="font-normal text-zinc-500 dark:text-zinc-400">
                    {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                  </div>
                </td>
                <td className="p-3">{appointment.dentist?.name ?? "—"}</td>
                <td className="p-3">{appointment.treatment?.title ?? "Not specified"}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[appointment.status]}`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    {isCancellable(appointment) && (
                      <PortalCancelAppointmentButton appointmentId={appointment.id} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
