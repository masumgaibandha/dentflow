"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TreatmentFilters,
  type TreatmentFiltersValue,
} from "@/components/treatments/TreatmentFilters";
import { TreatmentForm } from "@/components/treatments/TreatmentForm";
import { TreatmentTable } from "@/components/treatments/TreatmentTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useAuth";
import {
  useAdminTreatmentsList,
  useDeleteTreatment,
  useUpdateTreatment,
} from "@/hooks/useTreatments";
import type { Treatment } from "@/lib/api/treatmentsApi";
import { getErrorMessage } from "@/lib/errors";
import type { TreatmentFormValues } from "@/validators/treatment";

const DEFAULT_FILTERS: TreatmentFiltersValue = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "newest",
  sortOrder: "desc",
};

export default function ManageTreatmentsPage() {
  const { data: me } = useMe();
  const [filters, setFilters] = useState<TreatmentFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [deletingTreatment, setDeletingTreatment] = useState<Treatment | null>(null);

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page,
      limit: 10,
    }),
    [filters, page],
  );

  const { data, isLoading, isError, refetch } = useAdminTreatmentsList(
    queryParams,
    me?.clinic.id,
  );
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();

  function handleFiltersChange(next: TreatmentFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  async function handleUpdate(values: TreatmentFormValues) {
    if (!editingTreatment) return;
    try {
      await updateTreatment.mutateAsync({ id: editingTreatment.id, input: values });
      toast.success("Service updated successfully.");
      setEditingTreatment(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!deletingTreatment) return;
    try {
      await deleteTreatment.mutateAsync(deletingTreatment.id);
      toast.success("Service deleted.");
      setDeletingTreatment(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeletingTreatment(null);
    }
  }

  const publicCatalogHref = me?.clinic.slug
    ? `/items?clinic=${encodeURIComponent(me.clinic.slug)}`
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Manage services</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Edit or remove services from your public catalog.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {publicCatalogHref && (
            <Link href={publicCatalogHref} target="_blank" className="text-sm underline">
              View public catalog ↗
            </Link>
          )}
          <Link
            href="/items/add"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add service
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <TreatmentFilters value={filters} onChange={handleFiltersChange} />
      </div>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Something went wrong loading services.
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
          <div className="mt-6">
            <TreatmentTable
              treatments={data?.data ?? []}
              isLoading={isLoading}
              clinicSlug={me?.clinic.slug}
              onEdit={setEditingTreatment}
              onDelete={setDeletingTreatment}
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

      <Modal
        open={Boolean(editingTreatment)}
        title="Edit service"
        onClose={() => setEditingTreatment(null)}
      >
        {editingTreatment && (
          <TreatmentForm
            defaultValues={editingTreatment}
            onSubmit={handleUpdate}
            isSubmitting={updateTreatment.isPending}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingTreatment)}
        title="Delete service"
        description={`Are you sure you want to delete "${deletingTreatment?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingTreatment(null)}
        isLoading={deleteTreatment.isPending}
      />
    </div>
  );
}
