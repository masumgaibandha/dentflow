import { DentistRowSkeleton } from "@/components/ui/Skeleton";
import type { Dentist } from "@/lib/api/dentistsApi";

export function DentistTable({
  dentists,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: {
  dentists: Dentist[];
  isLoading: boolean;
  onView: (dentist: Dentist) => void;
  onEdit: (dentist: Dentist) => void;
  onDelete: (dentist: Dentist) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Specialty</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <DentistRowSkeleton key={i} />)}

          {!isLoading && dentists.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No dentists yet. Add your first one to get started.
              </td>
            </tr>
          )}

          {!isLoading &&
            dentists.map((dentist) => (
              <tr key={dentist.id}>
                <td className="p-3 font-medium">{dentist.name}</td>
                <td className="p-3">{dentist.specialty || "—"}</td>
                <td className="p-3">{dentist.email || "—"}</td>
                <td className="p-3">{dentist.phone || "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(dentist)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(dentist)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(dentist)}
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
