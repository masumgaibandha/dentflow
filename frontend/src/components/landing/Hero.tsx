"use client";

import Link from "next/link";
import { useState } from "react";

type Audience = "clinic" | "patient";

const COPY: Record<Audience, { eyebrow: string; heading: string; body: string }> = {
  clinic: {
    eyebrow: "For clinics",
    heading: "Run your dental practice from one place",
    body: "Manage patients, dentists, appointments, treatments, invoices, and clinical records - all scoped securely to your clinic, with role-based access for your whole team.",
  },
  patient: {
    eyebrow: "For patients",
    heading: "Book appointments and manage your care online",
    body: "See available times, book with the right dentist, pay securely online, and view the records your clinic chooses to share with you - all from your own portal.",
  },
};

// Lightweight, dependency-free interactive element: a click-driven audience
// toggle that swaps the headline/body/CTA copy. No carousel/animation
// library - just local state and a CSS transition.
export function Hero() {
  const [audience, setAudience] = useState<Audience>("clinic");
  const copy = COPY[audience];

  return (
    <section className="relative flex min-h-[65vh] flex-col justify-center overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-blue-50 to-white px-6 py-16 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <div
          role="tablist"
          aria-label="View DentFlow for clinics or patients"
          className="mb-8 inline-flex rounded-full border border-zinc-300 bg-white p-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {(["clinic", "patient"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={audience === option}
              onClick={() => setAudience(option)}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                audience === option
                  ? "bg-blue-600 text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {option === "clinic" ? "I'm a clinic" : "I'm a patient"}
            </button>
          ))}
        </div>

        <span className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          {copy.eyebrow}
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {copy.heading}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">{copy.body}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Register your clinic
          </Link>
          <Link
            href="/items"
            className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}
