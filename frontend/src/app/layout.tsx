import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemedToaster } from "@/components/ThemedToaster";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "DentFlow is a multi-tenant SaaS platform for dental clinics to manage patients, appointments, dentists, treatments, and billing in one place.";

export const metadata: Metadata = {
  title: {
    default: "DentFlow — Modern Dental Clinic Management",
    template: "%s | DentFlow",
  },
  description,
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "DentFlow — Modern Dental Clinic Management",
    description,
    siteName: "DentFlow",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The theme class is applied by next-themes on the client before
      // paint, but its first server-render value can't be known ahead of
      // time - suppressHydrationWarning here (the only place it's needed)
      // stops React from flagging that expected, one-time mismatch.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
