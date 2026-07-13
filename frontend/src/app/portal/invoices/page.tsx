"use client";

import { useState } from "react";
import { PortalInvoiceDetails } from "@/components/portal/PortalInvoiceDetails";
import { PortalInvoicesTable } from "@/components/portal/PortalInvoicesTable";
import { PortalPayInvoiceButton } from "@/components/portal/PortalPayInvoiceButton";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { usePortalInvoice, usePortalInvoicesList } from "@/hooks/usePortal";
import type { PortalInvoiceListItem } from "@/lib/api/portalApi";

export default function PortalInvoicesPage() {
  const [page, setPage] = useState(1);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = usePortalInvoicesList({ page, limit: 10 });
  const {
    data: invoiceDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = usePortalInvoice(viewingInvoiceId ?? "");

  function handleView(invoice: PortalInvoiceListItem) {
    setViewingInvoiceId(invoice.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your invoices</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        View your billing history. Contact your clinic for payment questions.
      </p>

      <div className="mt-6">
        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              Something went wrong loading your invoices.
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
            <PortalInvoicesTable
              invoices={data?.data ?? []}
              isLoading={isLoading}
              onView={handleView}
            />
            {data && (
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      <Modal
        open={Boolean(viewingInvoiceId)}
        title="Invoice details"
        onClose={() => setViewingInvoiceId(null)}
      >
        {isDetailLoading && (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-24 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        )}
        {isDetailError && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Something went wrong loading this invoice.
          </p>
        )}
        {invoiceDetail && (
          <div className="flex flex-col gap-4">
            <PortalInvoiceDetails invoice={invoiceDetail} />
            <PortalPayInvoiceButton invoice={invoiceDetail} />
          </div>
        )}
      </Modal>
    </div>
  );
}
