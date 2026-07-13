"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCancelPortalAppointment } from "@/hooks/usePortal";
import { getErrorMessage } from "@/lib/errors";

// Dedicated patient action - no edit/reschedule, cancel only, and always
// behind a confirmation step.
export function PortalCancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const cancelAppointment = useCancelPortalAppointment();

  async function handleConfirm() {
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      toast.success("Appointment cancelled.");
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
        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
      <ConfirmDialog
        open={confirming}
        title="Cancel this appointment?"
        description="This cannot be undone. You'll need to book a new appointment if you change your mind."
        confirmLabel="Cancel appointment"
        loadingLabel="Cancelling..."
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        isLoading={cancelAppointment.isPending}
      />
    </>
  );
}
