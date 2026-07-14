import type { PortalMedicalRecordDetail, PortalMedicalRecordType } from "@/lib/api/portalApi";

// Dedicated read-only component - no edit/delete/publish/finalize/amendment
// controls and no staff mutation hooks. Purely displays what the server
// already decided is safe and visible to this patient.

const RECORD_TYPE_LABELS: Record<PortalMedicalRecordType, string> = {
  consultation: "Consultation",
  diagnosis: "Diagnosis",
  procedure_note: "Procedure note",
  follow_up: "Follow-up",
  other: "Other",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PortalMedicalRecordDetails({ record }: { record: PortalMedicalRecordDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {RECORD_TYPE_LABELS[record.recordType]}
        </span>
        <h3 className="text-lg font-semibold">{record.title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatDateTime(record.recordDate)}</p>
      </div>

      {record.attendingDentist && (
        <div className="text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Attending dentist: </span>
          <span>{record.attendingDentist.name}</span>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Details</h4>
        <p className="mt-1 whitespace-pre-line rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {record.description}
        </p>
      </div>

      {record.amendments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Corrections &amp; additions
          </h4>
          <ul className="mt-2 flex flex-col gap-3">
            {record.amendments.map((amendment) => (
              <li
                key={amendment.id}
                className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-blue-900 dark:text-blue-200">{amendment.title}</span>
                  <span className="text-xs text-blue-700 dark:text-blue-400">
                    {formatDateTime(amendment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line text-blue-900 dark:text-blue-200">
                  {amendment.description}
                </p>
                {amendment.amendmentReason && (
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                    Reason: {amendment.amendmentReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
