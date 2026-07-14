"use client";

import Link from "next/link";
import { TreatmentCard } from "@/components/treatments/TreatmentCard";
import { TreatmentCardSkeleton } from "@/components/ui/Skeleton";
import { useTreatmentsList } from "@/hooks/useTreatments";
import { resolveClinicSlug } from "@/lib/publicClinic";

// Always resolves to a real clinic slug (deployment default, or this
// assignment's seeded demo clinic as the last resort) - see
// lib/publicClinic.ts. The landing page has no authenticated-user context of
// its own, so only the query-param tier doesn't apply here.
const CLINIC_SLUG = resolveClinicSlug({});

function FeaturedServicesFallback() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Each clinic on DentFlow publishes its own service catalog with real pricing and
        availability. Browse a clinic&apos;s services directly to see them in action.
      </p>
      <Link
        href="/items"
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Browse services
      </Link>
    </div>
  );
}

export function FeaturedServices() {
  const { data, isLoading, isError } = useTreatmentsList({
    clinicSlug: CLINIC_SLUG,
    sortBy: "newest",
    sortOrder: "desc",
    limit: 4,
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Featured dental services
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            A sample of the treatments clinics publish through DentFlow.
          </p>
        </div>
        <Link href="/items" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          View all services →
        </Link>
      </div>

      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <TreatmentCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && (isError || !data || data.data.length === 0) && <FeaturedServicesFallback />}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.data.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} clinicSlug={CLINIC_SLUG} />
          ))}
        </div>
      )}
    </section>
  );
}
