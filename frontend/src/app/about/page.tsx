import { PublicLayout } from "@/components/layout/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          About DentFlow
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          DentFlow is a multi-tenant practice management platform built for dental clinics. It
          brings patients, dentists, appointments, invoices, and clinical records together in one
          place, with each clinic operating in its own fully isolated workspace.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Why DentFlow exists
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Dental clinics juggle scheduling, billing, and clinical documentation across
            disconnected tools. DentFlow replaces that with a single platform where a clinic&apos;s
            admin, staff, and patients each get the view they actually need - without giving
            anyone more access than their role requires.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Benefits for clinics
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-zinc-600 dark:text-zinc-400">
            <li>One dashboard for day-to-day operations instead of several disconnected tools</li>
            <li>Staff accounts scoped separately from admin-level access</li>
            <li>A public service catalog patients can browse and book from directly</li>
            <li>Invoicing with real, verified card payments through Stripe</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Benefits for patients
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-zinc-600 dark:text-zinc-400">
            <li>Book and cancel appointments online without a phone call</li>
            <li>Pay invoices securely from a personal patient portal</li>
            <li>See clinical records only when a clinic chooses to share them</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Security &amp; tenant isolation
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Every piece of data in DentFlow - patients, appointments, invoices, and clinical
            records - is scoped to the clinic that owns it. Every API request is authenticated and
            filtered by the requesting user&apos;s clinic, so one clinic&apos;s data is never
            reachable through another clinic&apos;s account. Clinical records go further: even
            within a clinic, a record only becomes visible to a patient once staff explicitly
            publish it - nothing is shared automatically.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}
