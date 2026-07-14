const FEATURES = [
  {
    title: "Multi-tenant by design",
    body: "Every clinic's patients, appointments, and records are isolated from every other clinic - no shared visibility, ever.",
  },
  {
    title: "Role-based access",
    body: "Admins, staff, and patients each see exactly what they're supposed to - separate dashboards, separate permissions.",
  },
  {
    title: "Appointment scheduling",
    body: "Book, reschedule, and cancel appointments with automatic conflict checking against clinic hours and dentist availability.",
  },
  {
    title: "Stripe test payments",
    body: "Patient invoices are paid through Stripe's test-mode card payment flow, verified server-side before an invoice is ever marked paid.",
  },
  {
    title: "Clinical records",
    body: "Staff can document visits, finalize records, and add amendments - with a clear draft-vs-finalized workflow.",
  },
  {
    title: "Controlled record sharing",
    body: "Clinics choose exactly which finalized records become visible to a patient in their own portal.",
  },
];

export function PlatformFeatures() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Everything a clinic needs, built in
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          DentFlow covers the day-to-day operations of a dental practice, end to end.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
