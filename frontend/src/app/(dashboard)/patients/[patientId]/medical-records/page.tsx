"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AmendMedicalRecordForm } from "@/components/medical-records/AmendMedicalRecordForm";
import { MedicalRecordDetails } from "@/components/medical-records/MedicalRecordDetails";
import { MedicalRecordForm, toMedicalRecordInput } from "@/components/medical-records/MedicalRecordForm";
import { MedicalRecordList } from "@/components/medical-records/MedicalRecordList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { usePatient } from "@/hooks/usePatients";
import {
  useCreateAmendment,
  useCreateMedicalRecord,
  useDeleteMedicalRecord,
  useMedicalRecord,
  useMedicalRecordsList,
  useUpdateMedicalRecord,
} from "@/hooks/useMedicalRecords";
import type { MedicalRecordListItem, MedicalRecordStatus } from "@/lib/api/medicalRecordsApi";
import { toDatetimeLocal } from "@/lib/datetimeLocal";
import { getErrorMessage } from "@/lib/errors";
import type { AmendmentFormValues, MedicalRecordFormValues } from "@/validators/medicalRecord";

const STATUS_FILTERS: { label: string; value: MedicalRecordStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Finalized", value: "finalized" },
];

export default function PatientMedicalRecordsPage() {
  const params = useParams();
  const patientId = String(params.patientId);

  const [statusFilter, setStatusFilter] = useState<MedicalRecordStatus | "">("");
  const [page, setPage] = useState(1);

  const [isCreating, setIsCreating] = useState(false);
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [discardingRecord, setDiscardingRecord] = useState<MedicalRecordListItem | null>(null);
  const [amendingRecord, setAmendingRecord] = useState<{ id: string; title: string } | null>(null);

  const amendIdempotencyKeyRef = useRef(crypto.randomUUID());

  const { data: patient, isLoading: isPatientLoading, isError: isPatientError } = usePatient(patientId);

  const { data, isLoading, isError, refetch } = useMedicalRecordsList({
    patientId,
    status: statusFilter || undefined,
    sortOrder: "desc",
    page,
    limit: 10,
  });

  const { data: viewingRecord } = useMedicalRecord(viewingRecordId ?? "", Boolean(viewingRecordId));
  const { data: editingRecord } = useMedicalRecord(editingRecordId ?? "", Boolean(editingRecordId));

  const createRecord = useCreateMedicalRecord();
  const updateRecord = useUpdateMedicalRecord();
  const deleteRecord = useDeleteMedicalRecord();
  const createAmendment = useCreateAmendment();

  function handleFilterChange(value: MedicalRecordStatus | "") {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleCreate(values: MedicalRecordFormValues) {
    try {
      await createRecord.mutateAsync({ ...toMedicalRecordInput(values), patientId });
      toast.success("Draft medical record created.");
      setIsCreating(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleUpdate(values: MedicalRecordFormValues) {
    if (!editingRecordId) return;
    try {
      await updateRecord.mutateAsync({ id: editingRecordId, input: toMedicalRecordInput(values) });
      toast.success("Draft updated.");
      setEditingRecordId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDiscard() {
    if (!discardingRecord) return;
    try {
      await deleteRecord.mutateAsync({ id: discardingRecord.id, patientId });
      toast.success("Draft discarded.");
      setDiscardingRecord(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDiscardingRecord(null);
    }
  }

  async function handleAmend(values: AmendmentFormValues) {
    if (!amendingRecord) return;
    try {
      await createAmendment.mutateAsync({
        originalId: amendingRecord.id,
        input: values,
        idempotencyKey: amendIdempotencyKeyRef.current,
      });
      amendIdempotencyKeyRef.current = crypto.randomUUID();
      toast.success("Amendment added.");
      setAmendingRecord(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <Link
        href="/patients"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        ← Back to patients
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Medical records
            {!isPatientLoading && !isPatientError && patient ? ` — ${patient.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {isPatientLoading && "Loading patient..."}
            {isPatientError && "This patient could not be found."}
            {!isPatientLoading && !isPatientError && patient && (
              <>
                {patient.email || "No email on file"} · {patient.phone || "No phone on file"}
              </>
            )}
          </p>
        </div>
        {!isPatientError && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            New draft record
          </button>
        )}
      </div>

      {isPatientError ? (
        <div className="mt-8 text-center text-zinc-600 dark:text-zinc-400">
          Go back and select a valid patient to view their medical records.
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => handleFilterChange(filter.value)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                  statusFilter === filter.value
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isError ? (
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Something went wrong loading medical records.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <MedicalRecordList
                  records={data?.data ?? []}
                  isLoading={isLoading}
                  onView={(record) => setViewingRecordId(record.id)}
                  onEdit={(record) => setEditingRecordId(record.id)}
                  onDiscard={(record) => setDiscardingRecord(record)}
                  onAmend={(record) => setAmendingRecord({ id: record.id, title: record.title })}
                  onFinalized={() => refetch()}
                />
              </div>
              {data && (
                <Pagination
                  page={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </>
      )}

      <Modal open={isCreating} title="New draft medical record" onClose={() => setIsCreating(false)}>
        <MedicalRecordForm
          patientId={patientId}
          onSubmit={handleCreate}
          isSubmitting={createRecord.isPending}
          submitLabel="Create draft"
        />
      </Modal>

      <Modal
        open={Boolean(editingRecordId)}
        title="Edit draft medical record"
        onClose={() => setEditingRecordId(null)}
      >
        {editingRecord && (
          <MedicalRecordForm
            patientId={patientId}
            defaultValues={{
              recordType: editingRecord.recordType,
              title: editingRecord.title,
              description: editingRecord.description,
              recordDate: toDatetimeLocal(new Date(editingRecord.recordDate)),
              appointmentId: editingRecord.appointment?.id ?? "",
              attendingDentistId: editingRecord.attendingDentist?.id ?? "",
              dentistLabel: editingRecord.attendingDentist?.name ?? "",
            }}
            onSubmit={handleUpdate}
            isSubmitting={updateRecord.isPending}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <Modal
        open={Boolean(viewingRecordId)}
        title="Medical record details"
        onClose={() => setViewingRecordId(null)}
      >
        {viewingRecord && (
          <div className="flex flex-col gap-4">
            <MedicalRecordDetails
              record={viewingRecord}
              onViewAmendment={(amendmentId) => setViewingRecordId(amendmentId)}
            />
            {viewingRecord.status === "finalized" && !viewingRecord.isAmendment && (
              <button
                type="button"
                onClick={() =>
                  setAmendingRecord({ id: viewingRecord.id, title: viewingRecord.title })
                }
                className="self-start rounded-md border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                Add amendment
              </button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(discardingRecord)}
        title="Discard draft record"
        description={`Are you sure you want to discard the draft "${discardingRecord?.title}"? This can't be undone.`}
        confirmLabel="Discard"
        loadingLabel="Discarding..."
        onConfirm={handleDiscard}
        onCancel={() => setDiscardingRecord(null)}
        isLoading={deleteRecord.isPending}
      />

      <Modal
        open={Boolean(amendingRecord)}
        title="Add amendment"
        onClose={() => setAmendingRecord(null)}
      >
        {amendingRecord && (
          <AmendMedicalRecordForm
            originalTitle={amendingRecord.title}
            onSubmit={handleAmend}
            isSubmitting={createAmendment.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
