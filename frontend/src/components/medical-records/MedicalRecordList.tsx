import { FinalizeMedicalRecordButton } from "@/components/medical-records/FinalizeMedicalRecordButton";
import { MedicalRecordRowSkeleton } from "@/components/ui/Skeleton";
import type { MedicalRecordListItem, MedicalRecordType } from "@/lib/api/medicalRecordsApi";

const RECORD_TYPE_LABELS: Record<MedicalRecordType, string> = {
  consultation: "Consultation",
  diagnosis: "Diagnosis",
  procedure_note: "Procedure note",
  follow_up: "Follow-up",
  other: "Other",
};

function StatusBadge({ status }: { status: "draft" | "finalized" }) {
  const isDraft = status === "draft";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isDraft
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      }`}
    >
      {isDraft ? "Draft" : "Finalized"}
    </span>
  );
}

// Only ever shown for finalized records - a draft can never be
// patient-visible, so there is nothing meaningful to badge for one.
function VisibilityBadge({ patientVisible }: { patientVisible: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        patientVisible
          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {patientVisible ? "Visible to patient" : "Hidden from patient"}
    </span>
  );
}

export function MedicalRecordList({
  records,
  isLoading,
  onView,
  onEdit,
  onDiscard,
  onAmend,
  onFinalized,
}: {
  records: MedicalRecordListItem[];
  isLoading: boolean;
  onView: (record: MedicalRecordListItem) => void;
  onEdit: (record: MedicalRecordListItem) => void;
  onDiscard: (record: MedicalRecordListItem) => void;
  onAmend: (record: MedicalRecordListItem) => void;
  onFinalized: () => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Type</th>
            <th className="p-3">Record date</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <MedicalRecordRowSkeleton key={i} />)}

          {!isLoading && records.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No medical records yet for this patient.
              </td>
            </tr>
          )}

          {!isLoading &&
            records.map((record) => (
              <tr key={record.id}>
                <td className="p-3 font-medium">
                  {record.title}
                  {record.isAmendment && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Amendment
                    </span>
                  )}
                </td>
                <td className="p-3">{RECORD_TYPE_LABELS[record.recordType]}</td>
                <td className="p-3">{new Date(record.recordDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={record.status} />
                    {record.status === "finalized" && (
                      <VisibilityBadge patientVisible={record.patientVisible} />
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      View
                    </button>

                    {record.status === "draft" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(record)}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          Edit
                        </button>
                        <FinalizeMedicalRecordButton recordId={record.id} onFinalized={onFinalized} />
                        <button
                          type="button"
                          onClick={() => onDiscard(record)}
                          className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        >
                          Discard
                        </button>
                      </>
                    )}

                    {record.status === "finalized" && !record.isAmendment && (
                      <button
                        type="button"
                        onClick={() => onAmend(record)}
                        className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
                      >
                        Amend
                      </button>
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
