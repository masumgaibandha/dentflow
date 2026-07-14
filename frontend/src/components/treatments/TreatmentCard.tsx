import Link from "next/link";
import { TreatmentImage } from "@/components/treatments/TreatmentImage";
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
    // A plain, non-interactive wrapper - the clickable surfaces are the two
    // Links below (image/title block, and the explicit "View Details" link),
    // which are siblings rather than nested inside one another.
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:shadow-md dark:border-zinc-800">
      <Link
        href={href}
        aria-label={`View details for ${treatment.title}`}
        className="flex flex-1 flex-col"
      >
        <div className="h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <TreatmentImage
            src={treatment.imageUrl}
            alt={treatment.title}
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
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-3 text-sm dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold">${treatment.price.toFixed(2)}</span>
          <span className="text-zinc-500">{treatment.durationMinutes} min</span>
        </div>
        <Link
          href={href}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
