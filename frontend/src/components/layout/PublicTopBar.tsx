"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout, useMe } from "@/hooks/useAuth";

export function PublicTopBar() {
  const router = useRouter();
  const logout = useLogout();
  // Read-only: used purely to decide what to show. Never clears the token or
  // redirects on its own - visiting a public page must never log anyone out.
  const { data, isLoading } = useMe();
  const isAuthenticated = !isLoading && Boolean(data);

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/" className="font-semibold">
        DentFlow
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/items/manage" className="font-medium hover:underline">
              Manage Services
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
