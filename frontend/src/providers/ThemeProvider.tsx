"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Class-based (adds/removes `.dark` on <html>, matching the `@custom-variant
// dark` selector in globals.css), defaults to the OS preference on first
// visit, and persists the user's explicit choice (localStorage, next-themes'
// own default key) across refreshes and navigation.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
