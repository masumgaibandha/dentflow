"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLogout, useMe } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth/token";

// Separate from DashboardShell on purpose: patients must never see the
// admin/staff nav (Patients, Dentists, Invoices, Settings, Staff, etc), so
// this shell is built independently rather than reusing DashboardShell with
// conditional links.
export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const logout = useLogout();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (!isLoading && (isError || !data)) {
      router.replace("/login");
      return;
    }
    // Admin/staff users must never see the patient portal - send them home.
    if (!isLoading && data && data.user.role !== "patient") {
      router.replace(data.user.role === "admin" ? "/dashboard" : "/appointments");
    }
  }, [isLoading, isError, data, router]);

  if (!getToken() || isLoading || !data || data.user.role !== "patient") {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{data.clinic.name}</p>
            <p className="font-medium">{data.user.name}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/portal" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/portal/invoices" className="hover:underline">
              Invoices
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Log out
        </button>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
