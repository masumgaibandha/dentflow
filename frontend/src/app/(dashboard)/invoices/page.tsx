"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { InvoiceFilters, type InvoiceFiltersValue } from "@/components/invoices/InvoiceFilters";
import { InvoiceForm, type InvoiceFormDefaults } from "@/components/invoices/InvoiceForm";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { MarkPaidForm } from "@/components/invoices/MarkPaidForm";
import { AdminOnly } from "@/components/layout/AdminOnly";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useAuth";
import {
  useCreateInvoice,
  useDeleteInvoice,
  useInvoicesList,
  useMarkInvoicePaid,
  useUpdateInvoice,
  useVoidInvoice,
} from "@/hooks/useInvoices";
import { dollarsToCents, type Invoice } from "@/lib/api/invoicesApi";
import { getErrorMessage } from "@/lib/errors";
import type { InvoiceFormValues, MarkPaidFormValues } from "@/validators/invoice";

const DEFAULT_FILTERS: InvoiceFiltersValue = {
  status: "",
  dateFrom: "",
  dateTo: "",
};

export default function InvoicesPage() {
  return (
    <AdminOnly>
      <InvoicesPageContent />
    </AdminOnly>
  );
}

function InvoicesPageContent() {
  const { data: me } = useMe();
  const [filters, setFilters] = useState<InvoiceFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [markingPaidInvoice, setMarkingPaidInvoice] = useState<Invoice | null>(null);
  const [voidingInvoice, setVoidingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const queryParams = useMemo(
    () => ({
      status: filters.status || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page,
      limit: 10,
    }),
    [filters, page],
  );

  const { data, isLoading, isError, refetch } = useInvoicesList(queryParams, me?.clinic.id);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const markInvoicePaid = useMarkInvoicePaid();
  const voidInvoice = useVoidInvoice();
  const deleteInvoice = useDeleteInvoice();

  function handleFiltersChange(next: InvoiceFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  function toInvoiceInput(values: InvoiceFormValues) {
    return {
      patientId: values.patientId,
      appointmentId: values.appointmentId || undefined,
      lineItems: values.lineItems.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPriceCents: dollarsToCents(item.unitPrice),
      })),
      notes: values.notes || undefined,
    };
  }

  async function handleCreate(values: InvoiceFormValues) {
    try {
      await createInvoice.mutateAsync(toInvoiceInput(values));
      toast.success("Invoice created successfully.");
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleUpdate(values: InvoiceFormValues) {
    if (!editingInvoice) return;
    try {
      await updateInvoice.mutateAsync({ id: editingInvoice.id, input: toInvoiceInput(values) });
      toast.success("Invoice updated successfully.");
      setEditingInvoice(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleMarkPaid(values: MarkPaidFormValues) {
    if (!markingPaidInvoice) return;
    try {
      await markInvoicePaid.mutateAsync({
        id: markingPaidInvoice.id,
        input: { method: values.method, reference: values.reference || undefined },
      });
      toast.success("Invoice marked as paid.");
      setMarkingPaidInvoice(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleVoid() {
    if (!voidingInvoice) return;
    try {
      await voidInvoice.mutateAsync(voidingInvoice.id);
      toast.success("Invoice voided.");
      setVoidingInvoice(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setVoidingInvoice(null);
    }
  }

  async function handleDelete() {
    if (!deletingInvoice) return;
    try {
      await deleteInvoice.mutateAsync(deletingInvoice.id);
      toast.success("Invoice deleted.");
      setDeletingInvoice(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeletingInvoice(null);
    }
  }

  function editDefaults(invoice: Invoice): InvoiceFormDefaults {
    return {
      patientId: invoice.patient.id,
      patientLabel: invoice.patient.name ?? "",
      appointmentId: invoice.appointment?.id ?? "",
      appointmentLabel: invoice.appointment?.startTime
        ? new Date(invoice.appointment.startTime).toLocaleString()
        : "",
      lineItems: invoice.lineItems.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPriceCents / 100,
      })),
      notes: invoice.notes ?? "",
    };
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Bill patients and track payments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create invoice
        </button>
      </div>

      <div className="mt-6">
        <InvoiceFilters value={filters} onChange={handleFiltersChange} />
      </div>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Something went wrong loading invoices.</p>
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
            <InvoiceTable
              invoices={data?.data ?? []}
              isLoading={isLoading}
              onEdit={setEditingInvoice}
              onMarkPaid={setMarkingPaidInvoice}
              onVoid={setVoidingInvoice}
              onDelete={setDeletingInvoice}
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

      <Modal open={isAdding} title="Create invoice" onClose={() => setIsAdding(false)}>
        <InvoiceForm
          onSubmit={handleCreate}
          isSubmitting={createInvoice.isPending}
          submitLabel="Create invoice"
        />
      </Modal>

      <Modal
        open={Boolean(editingInvoice)}
        title="Edit invoice"
        onClose={() => setEditingInvoice(null)}
      >
        {editingInvoice && (
          <InvoiceForm
            defaultValues={editDefaults(editingInvoice)}
            onSubmit={handleUpdate}
            isSubmitting={updateInvoice.isPending}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <Modal
        open={Boolean(markingPaidInvoice)}
        title="Mark invoice as paid"
        onClose={() => setMarkingPaidInvoice(null)}
      >
        <MarkPaidForm onSubmit={handleMarkPaid} isSubmitting={markInvoicePaid.isPending} />
      </Modal>

      <ConfirmDialog
        open={Boolean(voidingInvoice)}
        title="Void invoice"
        description={`Are you sure you want to void invoice ${voidingInvoice?.invoiceNumber}? Voided invoices are kept for billing history but can no longer be paid or edited.`}
        confirmLabel="Void invoice"
        onConfirm={handleVoid}
        onCancel={() => setVoidingInvoice(null)}
        isLoading={voidInvoice.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingInvoice)}
        title="Delete invoice"
        description={`Are you sure you want to permanently delete invoice ${deletingInvoice?.invoiceNumber}? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingInvoice(null)}
        isLoading={deleteInvoice.isPending}
      />
    </div>
  );
}
