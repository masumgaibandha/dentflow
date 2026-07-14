import { Skeleton } from "@/components/ui/Skeleton";
import type { PortalMedicalRecordListItem, PortalMedicalRecordType } from "@/lib/api/portalApi";

// Dedicated read-only component for the patient portal - no edit/delete/
// publish/finalize/amendment controls and no staff mutation hooks imported.
// Not the staff MedicalRecordList with actions hidden by CSS; this component
// never had the capability in the first place.

const RECORD_TYPE_LABELS: Record<PortalMedicalRecordType, string> = {
  consultation: "Consultation",
  diagnosis: "Diagnosis",
  procedure_note: "Procedure note",
  follow_up: "Follow-up",
  other: "Other",
};

function PortalMedicalRecordRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
    </tr>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PortalMedicalRecordsList({
  records,
  isLoading,
  onView,
}: {
  records: PortalMedicalRecordListItem[];
  isLoading: boolean;
  onView: (record: PortalMedicalRecordListItem) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">Your medical records</caption>
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th scope="col" className="p-3">
              Title
            </th>
            <th scope="col" className="p-3">
              Type
            </th>
            <th scope="col" className="p-3">
              Date
            </th>
            <th scope="col" className="p-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <PortalMedicalRecordRowSkeleton key={i} />)}

          {!isLoading && records.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-zinc-500">
                No medical records have been shared with you
              </td>
            </tr>
          )}

          {!isLoading &&
            records.map((record) => (
              <tr key={record.id}>
                <td className="p-3 font-medium">
                  {record.title}
                  {record.hasVisibleAmendments && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Has updates
                    </span>
                  )}
                </td>
                <td className="p-3">{RECORD_TYPE_LABELS[record.recordType]}</td>
                <td className="p-3">{formatDate(record.recordDate)}</td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      View details
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
