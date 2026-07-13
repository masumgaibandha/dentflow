"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/hooks/useAuth";

// Client-side guard for admin-only pages. Backend 403 enforcement is the
// real authority here - this only prevents staff from ever seeing an
// admin-only page's content and redirects them somewhere they can use.
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && data && data.user.role !== "admin") {
      router.replace("/appointments");
    }
  }, [isLoading, data, router]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (data.user.role !== "admin") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-32 text-center">
        <p className="text-lg font-medium">Access denied</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This page is only available to clinic admins.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
