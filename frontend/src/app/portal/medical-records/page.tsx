"use client";

import { useState } from "react";
import { PortalMedicalRecordDetails } from "@/components/portal/PortalMedicalRecordDetails";
import { PortalMedicalRecordsList } from "@/components/portal/PortalMedicalRecordsList";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { usePortalMedicalRecord, usePortalMedicalRecordsList } from "@/hooks/usePortal";
import type { PortalMedicalRecordListItem } from "@/lib/api/portalApi";

export default function PortalMedicalRecordsPage() {
  const [page, setPage] = useState(1);
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = usePortalMedicalRecordsList({ page, limit: 10 });
  const {
    data: recordDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = usePortalMedicalRecord(viewingRecordId ?? "");

  function handleView(record: PortalMedicalRecordListItem) {
    setViewingRecordId(record.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your medical records</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Records your clinic has chosen to share with you. Contact your clinic if you have questions about
        your care.
      </p>

      <div className="mt-6">
        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              Something went wrong loading your medical records.
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
            <PortalMedicalRecordsList
              records={data?.data ?? []}
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
        open={Boolean(viewingRecordId)}
        title="Medical record details"
        onClose={() => setViewingRecordId(null)}
      >
        {isDetailLoading && (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-24 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        )}
        {isDetailError && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Something went wrong loading this record.
          </p>
        )}
        {recordDetail && <PortalMedicalRecordDetails record={recordDetail} />}
      </Modal>
    </div>
  );
}
