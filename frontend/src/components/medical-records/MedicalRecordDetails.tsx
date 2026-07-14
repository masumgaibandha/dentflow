import type { MedicalRecordDetail, MedicalRecordType } from "@/lib/api/medicalRecordsApi";

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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isDraft
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      }`}
    >
      {isDraft ? "Draft" : "Finalized"}
    </span>
  );
}

export function MedicalRecordDetails({
  record,
  onViewAmendment,
}: {
  record: MedicalRecordDetail;
  onViewAmendment?: (amendmentId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={record.status} />
        {record.isAmendment && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Amendment
          </span>
        )}
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {RECORD_TYPE_LABELS[record.recordType]}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-semibold">{record.title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date(record.recordDate).toLocaleString()} · Patient: {record.patient.name ?? "—"}
        </p>
      </div>

      {record.isAmendment && record.amendedRecord && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="font-medium text-blue-900 dark:text-blue-200">
            Amendment to &ldquo;{record.amendedRecord.title}&rdquo; (
            {new Date(record.amendedRecord.recordDate).toLocaleDateString()})
          </p>
          {record.amendmentReason && (
            <p className="mt-1 text-blue-800 dark:text-blue-300">Reason: {record.amendmentReason}</p>
          )}
        </div>
      )}

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Attending dentist</dt>
          <dd>{record.attendingDentist?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Linked appointment</dt>
          <dd>
            {record.appointment
              ? record.appointment.startTime
                ? new Date(record.appointment.startTime).toLocaleString()
                : "—"
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Author</dt>
          <dd>{record.author.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Finalized</dt>
          <dd>{record.finalizedAt ? new Date(record.finalizedAt).toLocaleString() : "Not yet"}</dd>
        </div>
      </dl>

      <div>
        <dt className="text-sm text-zinc-500 dark:text-zinc-400">Description</dt>
        <dd className="mt-1 whitespace-pre-line rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {record.description}
        </dd>
      </div>

      {!record.isAmendment && (
        <div>
          <h4 className="text-sm font-medium">Amendments {record.amendments.length > 0 ? `(${record.amendments.length})` : ""}</h4>
          {record.amendments.length === 0 ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              No amendments have been added to this record.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {record.amendments.map((amendment) => (
                <li
                  key={amendment.id}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{amendment.title}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(amendment.createdAt).toLocaleString()} · {amendment.author.name ?? "—"}
                    </span>
                  </div>
                  {amendment.amendmentReason && (
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      Reason: {amendment.amendmentReason}
                    </p>
                  )}
                  {onViewAmendment && (
                    <button
                      type="button"
                      onClick={() => onViewAmendment(amendment.id)}
                      className="mt-2 text-xs font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      View full amendment
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
