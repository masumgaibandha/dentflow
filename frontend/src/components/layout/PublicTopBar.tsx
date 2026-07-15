"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
    ? "font-semibold text-foreground"
    : "font-medium text-muted-foreground hover:text-foreground";
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

  // Prevents background scroll while the mobile slide-over is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function handleLogout() {
    logout();
    setMobileOpen(false);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3.5 lg:gap-4 lg:px-6">
        <Logo className="shrink-0" />

        {/* Desktop nav - centered links, controls grouped on the right.
            Tighter gap-5/gap-2 from md up to lg: at exactly 768px (the
            breakpoint where this switches from the mobile menu to this row),
            the full row - logo + up to 6 links (public + role app-link +
            Manage Services) + theme toggle + auth buttons - doesn't fit at
            the wider lg spacing, causing horizontal overflow. Reverts to the
            original, more spacious gaps at lg (1024px) and up, where there's
            room for them. */}
        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm md:flex lg:gap-8">
          {PUBLIC_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`relative py-1 ${linkClasses(pathname === link.href)}`}>
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-accent" aria-hidden="true" />
              )}
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
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex lg:gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Login
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Start Your Clinic
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground hover:bg-background-soft"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav - polished dropdown panel */}
      {mobileOpen && (
        <nav
          id="public-mobile-menu"
          className="flex flex-col gap-1 border-t border-border bg-background px-6 py-4 text-sm shadow-lg md:hidden"
        >
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-md px-2 py-2.5 ${linkClasses(pathname === link.href)} ${pathname === link.href ? "bg-surface-accent" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && appLink && (
            <Link
              href={appLink.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-md px-2 py-2.5 ${linkClasses(pathname === appLink.href)}`}
            >
              {appLink.label}
            </Link>
          )}
          {showManageServices && (
            <Link
              href="/items/manage"
              onClick={() => setMobileOpen(false)}
              className={`rounded-md px-2 py-2.5 ${linkClasses(pathname === "/items/manage")}`}
            >
              Manage Services
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className={buttonVariants({ variant: "outline", className: "mt-2 w-full" })}
            >
              Log out
            </button>
          ) : (
            <div className="mt-2 flex gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={buttonVariants({ variant: "outline", className: "flex-1" })}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className={buttonVariants({ variant: "primary", className: "flex-1" })}
              >
                Start Your Clinic
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
