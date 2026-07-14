import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-blue-600 px-6 py-16 dark:bg-blue-700">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Ready to bring your clinic online?
        </h2>
        <p className="max-w-xl text-blue-100">
          Register your clinic in minutes, or reach out if you have questions first.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Register your clinic
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
