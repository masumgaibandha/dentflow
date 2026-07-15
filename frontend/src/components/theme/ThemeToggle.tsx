"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// There's nothing to actually subscribe to here - this store never changes
// after mount, so the "subscribe" callback is a no-op that never fires.
// useSyncExternalStore is used purely for its getSnapshot/getServerSnapshot
// split: React itself resolves "true on the client, false during SSR"
// without a setState call anywhere, which is what keeps the React Compiler's
// react-hooks/set-state-in-effect rule from firing (unlike the equivalent
// useState+useEffect(() => setMounted(true)) pattern).
function subscribe() {
  return () => {};
}

function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

// Same 40x40 target size everywhere it's used (public desktop navbar, public
// mobile menu, authenticated DashboardShell/PortalShell headers) - a fixed
// h-10 w-10 button so it never shifts layout between the pre-mount blank
// state and the icon appearing once the persisted theme is known client-side.
//
// The `mounted` gate is required, not optional: next-themes resolves the
// persisted theme from localStorage synchronously during React's very first
// client render (that's how it avoids a flash-of-wrong-theme on the page
// itself), which means resolvedTheme can already differ from the server's
// render on that first pass - confirmed by an actual hydration-mismatch
// error when this component rendered its icon/aria-label directly off
// resolvedTheme without the guard. useMounted() (see above) supplies that
// gate the same way React's own docs recommend, without setState-in-effect.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-background-soft ${className ?? ""}`}
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )
      ) : (
        <span className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
