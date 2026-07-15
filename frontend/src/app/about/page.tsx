import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "DentFlow brings patients, dentists, appointments, invoices, and clinical records together in one secure, multi-tenant platform for dental clinics.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* 1. About hero */}
      <Section tone="soft" className="pb-12 sm:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-wide text-accent uppercase">About DentFlow</p>
            <h1 className="text-balance mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              One platform for a clinic&apos;s whole team, and every patient it cares for
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              DentFlow is a multi-tenant practice management platform built for dental clinics. It
              brings patients, dentists, appointments, invoices, and clinical records together in
              one place, with each clinic operating in its own fully isolated workspace.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-lg">
            <Image
              src="/assets/discussion_image.png"
              alt="A dentist, a dental assistant, and a clinic administrator reviewing patient and scheduling data together on a laptop and tablet"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-right"
            />
          </div>
        </div>
      </Section>

      {/* 2. Product story */}
      <Section tone="default">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Why DentFlow exists</h2>
          <p className="mt-4 text-muted-foreground">
            Dental clinics juggle scheduling, billing, and clinical documentation across
            disconnected tools. DentFlow replaces that with a single platform where a clinic&apos;s
            admin, staff, and patients each get the view they actually need - without giving
            anyone more access than their role requires.
          </p>
        </div>
      </Section>

      {/* 3. Mission and vision */}
      <Section tone="soft">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Mission</span>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              Replace disconnected tools with one secure platform
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Give every clinic a single, role-scoped home for patients, scheduling, billing, and
              clinical records - instead of the scattered spreadsheets and point tools most
              practices piece together today.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
            <span className="text-xs font-semibold tracking-wide text-accent uppercase">Vision</span>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              A clinic experience patients actually trust
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Clinic operations that are simple enough to run day to day, and patient data that
              stays exactly as private as each clinic and patient expects - nothing shared without
              an explicit choice to share it.
            </p>
          </div>
        </div>
      </Section>

      {/* 4. Helping clinics */}
      <Section tone="default">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-lg lg:order-2">
            <Image
              src="/assets/treatment_image.png"
              alt="A dentist examining a patient in a treatment chair, with the patient's information visible on a nearby monitor"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-right"
            />
          </div>
          <div className="lg:order-1">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">For clinics</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Less time on admin, more time with patients
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                One dashboard for day-to-day operations instead of several disconnected tools
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Staff accounts scoped separately from admin-level access
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                A public service catalog patients can browse and book from directly
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Invoicing with verified card payments through Stripe, currently in test mode
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 5. Helping patients */}
      <Section tone="soft">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-wide text-accent uppercase">For patients</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Your care, on your own schedule
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Book and cancel appointments online without a phone call
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Pay invoices securely from a personal patient portal
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                See clinical records only when a clinic chooses to share them
              </li>
            </ul>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-lg">
            <Image
              src="/assets/treatment_image2.png"
              alt="A patient in a dental chair speaking with a dentist and assistant, with a tooth diagram shown on a nearby screen"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-right"
            />
          </div>
        </div>
      </Section>

      {/* 6. Technology and connected care */}
      <Section tone="default">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Technology</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Connected care, secured by design
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every piece of data in DentFlow - patients, appointments, invoices, and clinical
            records - is scoped to the clinic that owns it. Every API request is authenticated and
            filtered by the requesting user&apos;s clinic, so one clinic&apos;s data is never
            reachable through another clinic&apos;s account. Clinical records go further: even
            within a clinic, a record only becomes visible to a patient once staff explicitly
            publish it - nothing is shared automatically.
          </p>
        </div>
      </Section>

      {/* 7. Final CTA */}
      <Section tone="soft">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            See DentFlow for your clinic or your care
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Register your clinic
            </Link>
            <Link href="/items" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Browse services
            </Link>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
