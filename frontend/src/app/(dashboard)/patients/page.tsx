"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PatientFilters, type PatientFiltersValue } from "@/components/patients/PatientFilters";
import { PatientForm } from "@/components/patients/PatientForm";
import { PatientTable } from "@/components/patients/PatientTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useAuth";
import {
  useCreatePatient,
  useDeletePatient,
  usePatientsList,
  useUpdatePatient,
} from "@/hooks/usePatients";
import type { Patient } from "@/lib/api/patientsApi";
import { getErrorMessage } from "@/lib/errors";
import type { PatientFormValues } from "@/validators/patient";

const DEFAULT_FILTERS: PatientFiltersValue = {
  search: "",
  sortBy: "newest",
  sortOrder: "desc",
};

export default function PatientsPage() {
  const { data: me } = useMe();
  const [filters, setFilters] = useState<PatientFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page,
      limit: 10,
    }),
    [filters, page],
  );

  const { data, isLoading, isError, refetch } = usePatientsList(queryParams, me?.clinic.id);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  function handleFiltersChange(next: PatientFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  function toPatientInput(values: PatientFormValues) {
    return {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      notes: values.notes || undefined,
    };
  }

  async function handleCreate(values: PatientFormValues) {
    try {
      await createPatient.mutateAsync(toPatientInput(values));
      toast.success("Patient added successfully.");
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleUpdate(values: PatientFormValues) {
    if (!editingPatient) return;
    try {
      await updatePatient.mutateAsync({ id: editingPatient.id, input: toPatientInput(values) });
      toast.success("Patient updated successfully.");
      setEditingPatient(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!deletingPatient) return;
    try {
      await deletePatient.mutateAsync(deletingPatient.id);
      toast.success("Patient deleted.");
      setDeletingPatient(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeletingPatient(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your clinic&apos;s patient records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add patient
        </button>
      </div>

      <div className="mt-6">
        <PatientFilters value={filters} onChange={handleFiltersChange} />
      </div>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Something went wrong loading patients.</p>
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
          <div className="mt-6">
            <PatientTable
              patients={data?.data ?? []}
              isLoading={isLoading}
              onEdit={setEditingPatient}
              onDelete={setDeletingPatient}
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

      <Modal open={isAdding} title="Add patient" onClose={() => setIsAdding(false)}>
        <PatientForm
          onSubmit={handleCreate}
          isSubmitting={createPatient.isPending}
          submitLabel="Add patient"
        />
      </Modal>

      <Modal
        open={Boolean(editingPatient)}
        title="Edit patient"
        onClose={() => setEditingPatient(null)}
      >
        {editingPatient && (
          <PatientForm
            defaultValues={{
              name: editingPatient.name,
              email: editingPatient.email ?? "",
              phone: editingPatient.phone ?? "",
              dateOfBirth: editingPatient.dateOfBirth
                ? editingPatient.dateOfBirth.slice(0, 10)
                : "",
              notes: editingPatient.notes ?? "",
            }}
            onSubmit={handleUpdate}
            isSubmitting={updatePatient.isPending}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingPatient)}
        title="Delete patient"
        description={`Are you sure you want to delete "${deletingPatient?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingPatient(null)}
        isLoading={deletePatient.isPending}
      />
    </div>
  );
}
