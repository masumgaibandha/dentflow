"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";

type Audience = "clinic" | "patient";

interface AudienceCopy {
  eyebrow: string;
  headline: string;
  description: string;
  image: { src: string; alt: string };
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  highlights: string[];
}

const COPY: Record<Audience, AudienceCopy> = {
  clinic: {
    eyebrow: "Dental clinic management, simplified",
    headline: "Run your clinic with clarity. Care for patients with confidence.",
    description:
      "Manage patients, appointments, treatment records, invoices, staff and payments from one secure platform.",
    image: {
      src: "/assets/hero_banner_3.png",
      alt: "A dentist, a dental assistant, and a patient reviewing a treatment plan together on a laptop and tablet in a modern clinic",
    },
    primaryCta: { label: "Start Your Clinic", href: "/register" },
    secondaryCta: { label: "Explore Services", href: "/items" },
    highlights: ["Organized clinic operations", "Secure patient records", "Billing and payment visibility"],
  },
  patient: {
    eyebrow: "Your dental care, organized",
    headline: "Manage your dental journey in one secure place.",
    description:
      "Browse services, manage appointments, review invoices, make secure payments and access shared medical records.",
    image: {
      src: "/assets/hero_banner_2.png",
      alt: "A dentist showing a patient their treatment information on a tablet during a consultation",
    },
    primaryCta: { label: "Browse Services", href: "/items" },
    secondaryCta: { label: "Patient Login", href: "/login" },
    highlights: ["Easy appointment access", "Secure online payments", "Shared medical records"],
  },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4L8 11.6l6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Split hero: content left, image right on desktop; text-first, image-below
// on mobile via source order (grid falls back to a single column). The
// Clinic/Patient toggle is the hero's one interaction - no carousel, no
// autoplay - and swaps every piece of copy plus the image together.
export function Hero() {
  const [audience, setAudience] = useState<Audience>("clinic");
  const copy = COPY[audience];

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background-soft to-background">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 lg:min-h-[70vh] lg:grid-cols-2 lg:py-20">
        <div>
          <div
            role="tablist"
            aria-label="View DentFlow for clinics or patients"
            className="mb-8 inline-flex rounded-full border border-border bg-surface p-1 text-sm shadow-sm"
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
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "clinic" ? "I'm a clinic" : "I'm a patient"}
              </button>
            ))}
          </div>

          {/* Remounted per audience (key={audience}) so the fade-in restarts
              on every switch - motion-safe: means it's a no-op under
              prefers-reduced-motion, not just a shorter animation. */}
          <div key={audience} className="motion-safe:animate-hero-fade">
            <span className="text-sm font-semibold tracking-wide text-accent uppercase">
              {copy.eyebrow}
            </span>
            <h1 className="text-balance mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {copy.headline}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{copy.description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={copy.primaryCta.href} className={buttonVariants({ variant: "primary", size: "lg" })}>
                {copy.primaryCta.label}
              </Link>
              <Link href={copy.secondaryCta.href} className={buttonVariants({ variant: "outline", size: "lg" })}>
                {copy.secondaryCta.label}
              </Link>
            </div>

            <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              {copy.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-lg sm:aspect-[16/10] lg:aspect-[4/3]">
            <Image
              key={copy.image.src}
              src={copy.image.src}
              alt={copy.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
