const STEPS = [
  {
    step: "1",
    title: "Register your clinic",
    body: "Create an admin account and your clinic's own isolated workspace in minutes.",
  },
  {
    step: "2",
    title: "Set up your practice",
    body: "Add dentists, staff accounts, your service catalog, and your weekly operating hours.",
  },
  {
    step: "3",
    title: "Patients book & pay",
    body: "Patients browse your services, book appointments, and pay invoices securely online.",
  },
  {
    step: "4",
    title: "Manage day to day",
    body: "Track appointments, invoices, and clinical records from one clinic dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-16 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            How it works
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            From sign-up to day-to-day operations in four steps.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
