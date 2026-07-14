import Link from "next/link";
import { TreatmentRowSkeleton } from "@/components/ui/Skeleton";
import type { Treatment } from "@/lib/api/treatmentsApi";

export function TreatmentTable({
  treatments,
  isLoading,
  clinicSlug,
  onEdit,
  onDelete,
}: {
  treatments: Treatment[];
  isLoading: boolean;
  // Preserves clinic context on the View link, same pattern as TreatmentCard -
  // the treatment list itself is already scoped server-side to the caller's
  // own clinic, so this can never point at another clinic's item.
  clinicSlug?: string;
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatment: Treatment) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Duration</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <TreatmentRowSkeleton key={i} />)}

          {!isLoading && treatments.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No services yet. Add your first one to get started.
              </td>
            </tr>
          )}

          {!isLoading &&
            treatments.map((treatment) => {
              const viewHref = clinicSlug
                ? `/items/${treatment.id}?clinic=${encodeURIComponent(clinicSlug)}`
                : `/items/${treatment.id}`;

              return (
                <tr key={treatment.id}>
                  <td className="p-3 font-medium">{treatment.title}</td>
                  <td className="p-3">{treatment.category}</td>
                  <td className="p-3">${treatment.price.toFixed(2)}</td>
                  <td className="p-3">{treatment.durationMinutes} min</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={viewHref}
                        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(treatment)}
                        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(treatment)}
                        className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
