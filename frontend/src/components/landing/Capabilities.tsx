// Real, verifiable facts about the platform's architecture and scope - not
// fabricated adoption numbers or business metrics. Framed as capabilities,
// each one true of the current build.
const CAPABILITIES = [
  { value: "3", label: "Role types", detail: "Admin, staff, and patient - each with its own scoped view" },
  { value: "100%", label: "Tenant isolated", detail: "Every query is scoped to the requesting clinic" },
  { value: "Live", label: "Stripe payments", detail: "Card payments run through Stripe's test-mode API" },
  { value: "Full", label: "Audit trail", detail: "Finalized records track who published what, and when" },
];

export function Capabilities() {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-16 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Built for how clinics actually run
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            A few specifics about what&apos;s under the hood.
          </p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {CAPABILITIES.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="text-3xl font-bold text-blue-600 dark:text-blue-400">{item.value}</dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{item.label}</dd>
              <dd className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
