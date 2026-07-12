import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">DentFlow</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Practice management for modern dental clinics. The public site is
        under construction.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Register your clinic
        </Link>
      </div>
    </div>
  );
}
