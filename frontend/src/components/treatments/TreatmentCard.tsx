import Link from "next/link";
import type { Treatment } from "@/lib/api/treatmentsApi";

export function TreatmentCard({
  treatment,
  clinicSlug,
}: {
  treatment: Treatment;
  clinicSlug?: string;
}) {
  const href = clinicSlug
    ? `/items/${treatment.id}?clinic=${encodeURIComponent(clinicSlug)}`
    : `/items/${treatment.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:shadow-md dark:border-zinc-800"
    >
      <div className="h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element -- imageUrl is an arbitrary admin-supplied URL, not a known host we can allowlist in next.config for next/image */}
        <img
          src={treatment.imageUrl}
          alt={treatment.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {treatment.category}
        </span>
        <h3 className="font-semibold">{treatment.title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {treatment.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="font-semibold">${treatment.price.toFixed(2)}</span>
          <span className="text-zinc-500">{treatment.durationMinutes} min</span>
        </div>
      </div>
    </Link>
  );
}
