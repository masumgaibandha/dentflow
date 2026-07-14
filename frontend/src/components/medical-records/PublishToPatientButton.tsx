"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useUpdateMedicalRecordVisibility } from "@/hooks/useMedicalRecords";
import { getErrorMessage } from "@/lib/errors";

// A single mutation handles both directions (see updateMedicalRecordVisibility
// in medical-record.service.ts - there is deliberately no separate
// publish/unpublish endpoint); this component just picks which confirmation
// copy and which boolean to send based on the record's current state.
export function PublishToPatientButton({
  recordId,
  patientVisible,
  className,
}: {
  recordId: string;
  patientVisible: boolean;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const updateVisibility = useUpdateMedicalRecordVisibility();

  async function handleConfirm() {
    try {
      await updateVisibility.mutateAsync({ id: recordId, patientVisible: !patientVisible });
      toast.success(patientVisible ? "Hidden from patient." : "Published to patient.");
      setConfirming(false);
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
          `rounded-md border px-2.5 py-1 text-xs font-medium ${
            patientVisible
              ? "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              : "border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:text-purple-300 dark:hover:bg-purple-950"
          }`
        }
      >
        {patientVisible ? "Hide from patient" : "Publish to patient"}
      </button>

      <ConfirmDialog
        open={confirming}
        title={patientVisible ? "Hide this record from the patient?" : "Publish this record to the patient?"}
        description={
          patientVisible
            ? "The patient will no longer be able to see this record (or, if this is an original, any of its amendments) in their portal. The clinical record itself is not changed or deleted."
            : "This will make the record's title and full description visible to the patient in their portal. If this is an original record, publishing it does not automatically publish its amendments - each must be published separately."
        }
        confirmLabel={patientVisible ? "Hide from patient" : "Publish to patient"}
        loadingLabel="Saving..."
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        isLoading={updateVisibility.isPending}
      />
    </>
  );
}
