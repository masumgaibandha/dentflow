import { Skeleton } from "@/components/ui/Skeleton";
import type { PortalAppointment } from "@/lib/api/portalApi";

// Dedicated read-only component for the patient portal - deliberately has no
// edit/cancel/delete/booking controls and imports no mutation hooks. This is
// not the admin AppointmentTable with actions hidden by CSS; it's a separate
// component that never has the capability in the first place.

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

export function PortalAppointmentsTable({
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
      <table className="w-full min-w-[560px] text-left text-sm">
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
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <PortalAppointmentRowSkeleton key={i} />)}

          {!isLoading && appointments.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-zinc-500">
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
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
