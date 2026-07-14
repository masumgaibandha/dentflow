"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useFinalizeMedicalRecord } from "@/hooks/useMedicalRecords";
import { getErrorMessage } from "@/lib/errors";

export function FinalizeMedicalRecordButton({
  recordId,
  onFinalized,
  className,
}: {
  recordId: string;
  onFinalized?: () => void;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const finalize = useFinalizeMedicalRecord();

  async function handleConfirm() {
    try {
      await finalize.mutateAsync(recordId);
      toast.success("Medical record finalized.");
      setConfirming(false);
      onFinalized?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setConfirming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={
          className ??
          "rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
        }
      >
        Finalize
      </button>

      <ConfirmDialog
        open={confirming}
        title="Finalize this medical record?"
        description="Once finalized, this record becomes permanently read-only: the title, description, patient, appointment, dentist, type, and date can never be edited or deleted again. Any future correction must be added as a separate amendment. This action cannot be undone."
        confirmLabel="Finalize permanently"
        loadingLabel="Finalizing..."
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        isLoading={finalize.isPending}
      />
    </>
  );
}
