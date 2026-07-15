"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

// Keeps toast styling in sync with the active theme instead of sonner's own
// OS-preference default, so a manually-selected light/dark choice is
// respected for toasts too.
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors position="top-center" theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}
