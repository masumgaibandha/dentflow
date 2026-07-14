function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`mt-0.5 shrink-0 ${className}`}
    >
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BenefitList({ items, iconClassName }: { items: string[]; iconClassName: string }) {
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <CheckIcon className={iconClassName} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const CLINIC_BENEFITS = [
  "One dashboard for patients, dentists, appointments, invoices, and records",
  "Staff accounts with permissions separate from admin access",
  "Automatic conflict checking so dentists are never double-booked",
  "Clinic-controlled visibility over which records patients can see",
];

export function ClinicBenefits() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-lg border border-zinc-200 p-8 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Benefits for clinics
        </span>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Less admin work, more patient time
        </h2>
        <BenefitList items={CLINIC_BENEFITS} iconClassName="text-blue-600 dark:text-blue-400" />
      </div>
    </section>
  );
}

const PATIENT_BENEFITS = [
  "Book and cancel appointments online, any time",
  "Pay invoices securely by card without calling the front desk",
  "View the appointments and invoices tied to your own account",
  "See clinical records only once your clinic chooses to share them",
];

export function PatientBenefits() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="mx-auto max-w-2xl rounded-lg border border-zinc-200 p-8 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Benefits for patients
        </span>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Care that fits your schedule
        </h2>
        <BenefitList items={PATIENT_BENEFITS} iconClassName="text-emerald-600 dark:text-emerald-400" />
      </div>
    </section>
  );
}
