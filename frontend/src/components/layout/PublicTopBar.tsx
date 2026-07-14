"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLogout, useMe } from "@/hooks/useAuth";

interface NavLink {
  href: string;
  label: string;
}

const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/items", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// The one authenticated destination each role is actually authorized to
// land on - never a link a role could click into and get a 403/"Access
// denied" for.
function appLinkForRole(role: "admin" | "staff" | "patient"): NavLink {
  if (role === "patient") return { href: "/portal", label: "Portal" };
  if (role === "staff") return { href: "/appointments", label: "Appointments" };
  return { href: "/dashboard", label: "Dashboard" };
}

function linkClasses(isActive: boolean): string {
  return isActive
    ? "font-semibold text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
    : "font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
}

export function PublicTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Read-only: used purely to decide what to show. Never clears the token or
  // redirects on its own - visiting a public page must never log anyone out.
  const { data, isLoading } = useMe();
  const isAuthenticated = !isLoading && Boolean(data);

  const appLink = data ? appLinkForRole(data.user.role) : null;
  // Manage Services is admin-only (AdminOnly redirects/denies everyone else)
  // - never shown to staff or patient, so it can never be a dead-end 403 link.
  const showManageServices = data?.user.role === "admin";

  function handleLogout() {
    logout();
    setMobileOpen(false);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          DentFlow
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {PUBLIC_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClasses(pathname === link.href)}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated && appLink && (
            <Link href={appLink.href} className={linkClasses(pathname === appLink.href)}>
              {appLink.label}
            </Link>
          )}
          {showManageServices && (
            <Link href="/items/manage" className={linkClasses(pathname === "/items/manage")}>
              Manage Services
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 md:hidden dark:border-zinc-700"
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
          id="public-mobile-menu"
          className="flex flex-col gap-1 border-t border-zinc-200 px-6 py-4 text-sm md:hidden dark:border-zinc-800"
        >
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`py-2 ${linkClasses(pathname === link.href)}`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && appLink && (
            <Link
              href={appLink.href}
              onClick={() => setMobileOpen(false)}
              className={`py-2 ${linkClasses(pathname === appLink.href)}`}
            >
              {appLink.label}
            </Link>
          )}
          {showManageServices && (
            <Link
              href="/items/manage"
              onClick={() => setMobileOpen(false)}
              className={`py-2 ${linkClasses(pathname === "/items/manage")}`}
            >
              Manage Services
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-md border border-zinc-300 px-3 py-2 text-left font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Log out
            </button>
          ) : (
            <div className="mt-2 flex gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-center font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-center font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
