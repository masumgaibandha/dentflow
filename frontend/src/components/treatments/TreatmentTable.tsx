import Link from "next/link";
import { TreatmentRowSkeleton } from "@/components/ui/Skeleton";
import type { Treatment } from "@/lib/api/treatmentsApi";

function treatmentViewHref(treatment: Treatment, clinicSlug?: string): string {
  return clinicSlug
    ? `/items/${treatment.id}?clinic=${encodeURIComponent(clinicSlug)}`
    : `/items/${treatment.id}`;
}

// Same backward-compatible convention as the backend's own active-record
// queries: absent/undefined means active, only `false` means inactive.
function isTreatmentActive(treatment: Treatment): boolean {
  return treatment.isActive !== false;
}

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
    <>
      {/* Desktop/tablet table - unchanged, just hidden below sm now that the
          stacked-card layout below covers narrow screens instead of relying
          on horizontal scroll. */}
      <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 sm:block dark:border-zinc-800">
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
              treatments.map((treatment) => (
                <tr key={treatment.id}>
                  <td className="p-3 font-medium">{treatment.title}</td>
                  <td className="p-3">{treatment.category}</td>
                  <td className="p-3">${treatment.price.toFixed(2)}</td>
                  <td className="p-3">{treatment.durationMinutes} min</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={treatmentViewHref(treatment, clinicSlug)}
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
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked-card layout - same data/actions as the table above,
          just reflowed instead of horizontally scrolled. */}
      <div className="flex flex-col gap-3 sm:hidden">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}

        {!isLoading && treatments.length === 0 && (
          <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
            No services yet. Add your first one to get started.
          </div>
        )}

        {!isLoading &&
          treatments.map((treatment) => {
            const active = isTreatmentActive(treatment);

            return (
              <div
                key={treatment.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{treatment.title}</p>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {treatment.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold">${treatment.price.toFixed(2)}</p>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={treatmentViewHref(treatment, clinicSlug)}
                    className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-center text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(treatment)}
                    className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(treatment)}
                    className="flex-1 rounded-md border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
