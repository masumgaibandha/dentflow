"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddStaffForm } from "@/components/users/AddStaffForm";
import { StaffUserTable } from "@/components/users/StaffUserTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useAuth";
import { useCreateStaffUser, useUpdateUserStatus, useUsersList } from "@/hooks/useUsers";
import type { ClinicUser } from "@/lib/api/usersApi";
import { getErrorMessage } from "@/lib/errors";
import type { CreateStaffFormValues } from "@/validators/staffUser";

export default function StaffUsersPage() {
  const { data: me } = useMe();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [togglingUser, setTogglingUser] = useState<ClinicUser | null>(null);

  const queryParams = useMemo(
    () => ({ search: search || undefined, page, limit: 10 }),
    [search, page],
  );

  const { data, isLoading, isError, refetch } = useUsersList(queryParams, me?.clinic.id);
  const createStaff = useCreateStaffUser();
  const updateStatus = useUpdateUserStatus();

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  async function handleCreate(values: CreateStaffFormValues) {
    try {
      await createStaff.mutateAsync(values);
      toast.success("Staff account added.");
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleToggleStatus() {
    if (!togglingUser) return;
    try {
      await updateStatus.mutateAsync({ id: togglingUser.id, isActive: !togglingUser.isActive });
      toast.success(togglingUser.isActive ? "Staff account deactivated." : "Staff account activated.");
      setTogglingUser(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setTogglingUser(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Staff accounts</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage who on your team can access DentFlow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add staff account
        </button>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Something went wrong loading staff accounts.
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
            <StaffUserTable
              users={data?.data ?? []}
              isLoading={isLoading}
              onToggleStatus={setTogglingUser}
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

      <Modal open={isAdding} title="Add staff account" onClose={() => setIsAdding(false)}>
        <AddStaffForm onSubmit={handleCreate} isSubmitting={createStaff.isPending} />
      </Modal>

      <ConfirmDialog
        open={Boolean(togglingUser)}
        title={togglingUser?.isActive ? "Deactivate staff account" : "Activate staff account"}
        description={
          togglingUser?.isActive
            ? `Are you sure you want to deactivate ${togglingUser?.name}? They will be signed out immediately and won't be able to log back in until reactivated.`
            : `Are you sure you want to reactivate ${togglingUser?.name}? They will be able to log in again.`
        }
        confirmLabel={togglingUser?.isActive ? "Deactivate" : "Activate"}
        loadingLabel={togglingUser?.isActive ? "Deactivating..." : "Activating..."}
        onConfirm={handleToggleStatus}
        onCancel={() => setTogglingUser(null)}
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
