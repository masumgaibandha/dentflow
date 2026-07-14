"use client";

import Link from "next/link";
import { useMe } from "@/hooks/useAuth";

// No Privacy/Terms link - those pages don't exist yet, and a dead link is
// worse than no link. No social links either - there are no real profile
// URLs for this project, and inventing placeholder ones is explicitly
// disallowed; omit the whole row rather than fake it.
export function Footer() {
  const { data, isLoading } = useMe();
  const isAuthenticated = !isLoading && Boolean(data);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="text-lg font-semibold">
            DentFlow
          </Link>
          <p className="mt-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
            Multi-tenant practice management for modern dental clinics.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Site</span>
            <Link href="/" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Home
            </Link>
            <Link href="/items" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Services
            </Link>
            <Link href="/about" className="text-zinc-600 hover:underline dark:text-zinc-400">
              About
            </Link>
            <Link href="/contact" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Contact
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Account</span>
              <Link href="/login" className="text-zinc-600 hover:underline dark:text-zinc-400">
                Login
              </Link>
              <Link href="/register" className="text-zinc-600 hover:underline dark:text-zinc-400">
                Register
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Contact</span>
            <a
              href="mailto:masumgaibandha@gmail.com"
              className="text-zinc-600 hover:underline dark:text-zinc-400"
            >
              masumgaibandha@gmail.com
            </a>
          </div>
        </nav>
      </div>

      <div className="border-t border-zinc-200 px-6 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        © {new Date().getFullYear()} DentFlow. All rights reserved.
      </div>
    </footer>
  );
}
