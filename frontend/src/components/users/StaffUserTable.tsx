import { Skeleton } from "@/components/ui/Skeleton";
import type { ClinicUser } from "@/lib/api/usersApi";

function StaffRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
    </tr>
  );
}

export function StaffUserTable({
  users,
  isLoading,
  onToggleStatus,
}: {
  users: ClinicUser[];
  isLoading: boolean;
  onToggleStatus: (user: ClinicUser) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <StaffRowSkeleton key={i} />)}

          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-zinc-500">
                No staff accounts yet. Add one to get started.
              </td>
            </tr>
          )}

          {!isLoading &&
            users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {user.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    {user.role === "admin" ? (
                      <span className="text-xs text-zinc-400">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user)}
                        className={
                          user.isActive
                            ? "rounded-md border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950"
                            : "rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"
                        }
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
