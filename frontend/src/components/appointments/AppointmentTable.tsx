import { Skeleton } from "@/components/ui/Skeleton";
import type { Appointment } from "@/lib/api/appointmentsApi";

function AppointmentRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
    </tr>
  );
}

const STATUS_BADGE_CLASSES: Record<Appointment["status"], string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function AppointmentTable({
  appointments,
  isLoading,
  onEdit,
  onCancel,
  onDelete,
}: {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-3">Patient</th>
            <th className="p-3">Dentist</th>
            <th className="p-3">When</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <AppointmentRowSkeleton key={i} />)}

          {!isLoading && appointments.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No appointments yet. Schedule your first one to get started.
              </td>
            </tr>
          )}

          {!isLoading &&
            appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="p-3 font-medium">{appointment.patient.name ?? "—"}</td>
                <td className="p-3">{appointment.dentist.name ?? "—"}</td>
                <td className="p-3">
                  {new Date(appointment.startTime).toLocaleString()} –{" "}
                  {new Date(appointment.endTime).toLocaleTimeString()}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[appointment.status]}`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(appointment)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    {appointment.status === "scheduled" && (
                      <button
                        type="button"
                        onClick={() => onCancel(appointment)}
                        className="rounded-md border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(appointment)}
                      className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
