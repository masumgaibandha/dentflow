"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Is my clinic's data isolated from other clinics?",
    answer:
      "Yes. Every record in DentFlow - patients, appointments, invoices, clinical notes - is scoped to a single clinic. There is no shared visibility between clinics.",
  },
  {
    question: "How do payments work?",
    answer:
      "Patients pay invoices with a card through Stripe, currently running in Stripe's test mode. Payment success is always verified server-side before an invoice is marked paid.",
  },
  {
    question: "Can patients see their own medical records?",
    answer:
      "Only the records - and only the finalized ones - that a clinic explicitly chooses to publish to that patient's portal. Nothing is shared automatically.",
  },
  {
    question: "What's the difference between staff and admin accounts?",
    answer:
      "Admins manage clinic-wide settings, staff accounts, invoices, and the service catalog. Staff handle day-to-day patient care - appointments, records, and dentist scheduling.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Frequently asked questions
        </h2>
      </div>

      <div className="mt-10 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="py-4">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 text-left font-medium text-zinc-900 dark:text-zinc-100"
              >
                {item.question}
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
