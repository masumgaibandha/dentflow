"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLogout, useMe } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth/token";

interface NavLink {
  href: string;
  label: string;
}

function linkClasses(isActive: boolean): string {
  return isActive
    ? "font-semibold text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
    : "font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
}

const PORTAL_LINKS: NavLink[] = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/medical-records", label: "Medical records" },
  // Public catalog page, not a new backend permission - PublicTopBar already
  // recognizes a logged-in patient and shows their Portal link + Log out
  // instead of Login/Register, so this is a safe 5th portal nav route.
  // Labelled distinctly from the admin-only "Services" (Manage Services)
  // link so the two are never confused with each other.
  { href: "/items", label: "Browse Services" },
];

// Separate from DashboardShell on purpose: patients must never see the
// admin/staff nav (Patients, Dentists, Invoices, Settings, Staff, etc), so
// this shell is built independently rather than reusing DashboardShell with
// conditional links.
export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useMe();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  // Same Escape-to-close pattern as Modal.tsx/ConfirmDialog.tsx, plus a
  // click-outside dismissal - matches DashboardShell's mobile menu.
  useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [mobileOpen]);

  if (!getToken() || isLoading || !data || data.user.role !== "patient") {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  function handleLogout() {
    logout();
    setMobileOpen(false);
    router.push("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          {/* min-w-0 + truncate: a long clinic or user name must shrink,
              never push the nav/logout out of the viewport. */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{data.clinic.name}</p>
            <p className="truncate font-medium">{data.user.name}</p>
          </div>

          {/* Desktop nav */}
          <nav className="hidden shrink-0 items-center gap-4 text-sm md:flex">
            {PORTAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClasses(pathname === link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 md:inline-flex dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Log out
          </button>

          {/* Mobile menu toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="portal-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 md:hidden dark:border-zinc-700"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav
            ref={menuRef}
            id="portal-mobile-menu"
            className="flex flex-col gap-1 border-t border-zinc-200 px-6 py-4 text-sm md:hidden dark:border-zinc-800"
          >
            {PORTAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`py-2 ${linkClasses(pathname === link.href)}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-md border border-zinc-300 px-3 py-2 text-left font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Log out
            </button>
          </nav>
        )}
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
