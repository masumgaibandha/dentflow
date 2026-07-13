"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppointmentFilters, type AppointmentFiltersValue } from "@/components/appointments/AppointmentFilters";
import { AppointmentForm, type AppointmentFormDefaults } from "@/components/appointments/AppointmentForm";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useAuth";
import {
  useAppointmentsList,
  useCancelAppointment,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/hooks/useAppointments";
import type { Appointment } from "@/lib/api/appointmentsApi";
import { toDatetimeLocal } from "@/lib/datetimeLocal";
import { getErrorMessage } from "@/lib/errors";
import type { AppointmentFormValues } from "@/validators/appointment";

const DEFAULT_FILTERS: AppointmentFiltersValue = {
  dateFrom: "",
  dateTo: "",
  dentistId: "",
  status: "",
};

export default function AppointmentsPage() {
  const { data: me } = useMe();
  const [filters, setFilters] = useState<AppointmentFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

  const queryParams = useMemo(
    () => ({
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      dentistId: filters.dentistId || undefined,
      status: filters.status || undefined,
      page,
      limit: 10,
    }),
    [filters, page],
  );

  const { data, isLoading, isError, refetch } = useAppointmentsList(queryParams, me?.clinic.id);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();
  const deleteAppointment = useDeleteAppointment();

  function handleFiltersChange(next: AppointmentFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  function toAppointmentInput(values: AppointmentFormValues) {
    return {
      patientId: values.patientId,
      dentistId: values.dentistId,
      treatmentId: values.treatmentId || undefined,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
      notes: values.notes || undefined,
    };
  }

  async function handleCreate(values: AppointmentFormValues) {
    try {
      await createAppointment.mutateAsync(toAppointmentInput(values));
      toast.success("Appointment scheduled successfully.");
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleUpdate(values: AppointmentFormValues) {
    if (!editingAppointment) return;
    try {
      await updateAppointment.mutateAsync({
        id: editingAppointment.id,
        input: toAppointmentInput(values),
      });
      toast.success("Appointment updated successfully.");
      setEditingAppointment(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleCancel() {
    if (!cancellingAppointment) return;
    try {
      await cancelAppointment.mutateAsync(cancellingAppointment.id);
      toast.success("Appointment cancelled.");
      setCancellingAppointment(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setCancellingAppointment(null);
    }
  }

  async function handleDelete() {
    if (!deletingAppointment) return;
    try {
      await deleteAppointment.mutateAsync(deletingAppointment.id);
      toast.success("Appointment deleted.");
      setDeletingAppointment(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeletingAppointment(null);
    }
  }

  function editDefaults(appointment: Appointment): AppointmentFormDefaults {
    return {
      patientId: appointment.patient.id,
      patientLabel: appointment.patient.name ?? "",
      dentistId: appointment.dentist.id,
      dentistLabel: appointment.dentist.name ?? "",
      treatmentId: appointment.treatment?.id ?? "",
      treatmentLabel: appointment.treatment?.title ?? "",
      startTime: toDatetimeLocal(new Date(appointment.startTime)),
      endTime: toDatetimeLocal(new Date(appointment.endTime)),
      notes: appointment.notes ?? "",
    };
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Schedule and manage your clinic&apos;s appointments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Schedule appointment
        </button>
      </div>

      <div className="mt-6">
        <AppointmentFilters value={filters} onChange={handleFiltersChange} />
      </div>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Something went wrong loading appointments.
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
            <AppointmentTable
              appointments={data?.data ?? []}
              isLoading={isLoading}
              onEdit={setEditingAppointment}
              onCancel={setCancellingAppointment}
              onDelete={setDeletingAppointment}
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

      <Modal open={isAdding} title="Schedule appointment" onClose={() => setIsAdding(false)}>
        <AppointmentForm
          onSubmit={handleCreate}
          isSubmitting={createAppointment.isPending}
          submitLabel="Schedule appointment"
        />
      </Modal>

      <Modal
        open={Boolean(editingAppointment)}
        title="Edit appointment"
        onClose={() => setEditingAppointment(null)}
      >
        {editingAppointment && (
          <AppointmentForm
            defaultValues={editDefaults(editingAppointment)}
            onSubmit={handleUpdate}
            isSubmitting={updateAppointment.isPending}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancellingAppointment)}
        title="Cancel appointment"
        description="Are you sure you want to cancel this appointment? The time slot will become available again."
        confirmLabel="Cancel appointment"
        onConfirm={handleCancel}
        onCancel={() => setCancellingAppointment(null)}
        isLoading={cancelAppointment.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingAppointment)}
        title="Delete appointment"
        description="Are you sure you want to permanently delete this appointment? This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingAppointment(null)}
        isLoading={deleteAppointment.isPending}
      />
    </div>
  );
}
