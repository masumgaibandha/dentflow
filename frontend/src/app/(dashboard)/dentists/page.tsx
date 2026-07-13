"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DentistDetails } from "@/components/dentists/DentistDetails";
import { DentistFilters, type DentistFiltersValue } from "@/components/dentists/DentistFilters";
import { DentistForm } from "@/components/dentists/DentistForm";
import { DentistTable } from "@/components/dentists/DentistTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useAuth";
import {
  useCreateDentist,
  useDeleteDentist,
  useDentistsList,
  useUpdateDentist,
} from "@/hooks/useDentists";
import type { Dentist } from "@/lib/api/dentistsApi";
import { getErrorMessage } from "@/lib/errors";
import type { DentistFormValues } from "@/validators/dentist";

const DEFAULT_FILTERS: DentistFiltersValue = {
  search: "",
  sortBy: "newest",
  sortOrder: "desc",
};

export default function DentistsPage() {
  const { data: me } = useMe();
  const [filters, setFilters] = useState<DentistFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingDentist, setViewingDentist] = useState<Dentist | null>(null);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);
  const [deletingDentist, setDeletingDentist] = useState<Dentist | null>(null);

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

  const { data, isLoading, isError, refetch } = useDentistsList(queryParams, me?.clinic.id);
  const createDentist = useCreateDentist();
  const updateDentist = useUpdateDentist();
  const deleteDentist = useDeleteDentist();

  function handleFiltersChange(next: DentistFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  function toDentistInput(values: DentistFormValues) {
    return {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      specialty: values.specialty || undefined,
    };
  }

  async function handleCreate(values: DentistFormValues) {
    try {
      await createDentist.mutateAsync(toDentistInput(values));
      toast.success("Dentist added successfully.");
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleUpdate(values: DentistFormValues) {
    if (!editingDentist) return;
    try {
      await updateDentist.mutateAsync({ id: editingDentist.id, input: toDentistInput(values) });
      toast.success("Dentist updated successfully.");
      setEditingDentist(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!deletingDentist) return;
    try {
      await deleteDentist.mutateAsync(deletingDentist.id);
      toast.success("Dentist deleted.");
      setDeletingDentist(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeletingDentist(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dentists</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your clinic&apos;s dentists.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add dentist
        </button>
      </div>

      <div className="mt-6">
        <DentistFilters value={filters} onChange={handleFiltersChange} />
      </div>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Something went wrong loading dentists.</p>
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
            <DentistTable
              dentists={data?.data ?? []}
              isLoading={isLoading}
              onView={setViewingDentist}
              onEdit={setEditingDentist}
              onDelete={setDeletingDentist}
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

      <Modal open={isAdding} title="Add dentist" onClose={() => setIsAdding(false)}>
        <DentistForm
          onSubmit={handleCreate}
          isSubmitting={createDentist.isPending}
          submitLabel="Add dentist"
        />
      </Modal>

      <Modal
        open={Boolean(viewingDentist)}
        title="Dentist details"
        onClose={() => setViewingDentist(null)}
      >
        {viewingDentist && <DentistDetails dentist={viewingDentist} />}
      </Modal>

      <Modal
        open={Boolean(editingDentist)}
        title="Edit dentist"
        onClose={() => setEditingDentist(null)}
      >
        {editingDentist && (
          <DentistForm
            defaultValues={{
              name: editingDentist.name,
              email: editingDentist.email ?? "",
              phone: editingDentist.phone ?? "",
              specialty: editingDentist.specialty ?? "",
            }}
            onSubmit={handleUpdate}
            isSubmitting={updateDentist.isPending}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingDentist)}
        title="Delete dentist"
        description={`Are you sure you want to delete "${deletingDentist?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingDentist(null)}
        isLoading={deleteDentist.isPending}
      />
    </div>
  );
}
