"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { TreatmentCard } from "@/components/treatments/TreatmentCard";
import { TreatmentImage } from "@/components/treatments/TreatmentImage";
import { useMe } from "@/hooks/useAuth";
import { useTreatment, useTreatmentsList } from "@/hooks/useTreatments";
import type { Treatment, TreatmentCategory } from "@/lib/api/treatmentsApi";
import { resolveClinicSlug } from "@/lib/publicClinic";

// Other active services in the same category and clinic, excluding this one -
// "related" is scoped to category because that's the only similarity signal
// the treatment catalog has (no tags/collections). Renders nothing rather
// than an empty section when there's nothing to relate.
function RelatedServices({
  clinicSlug,
  category,
  excludeId,
}: {
  clinicSlug: string;
  category: TreatmentCategory;
  excludeId: string;
}) {
  const { data } = useTreatmentsList({
    clinicSlug,
    category,
    page: 1,
    limit: 4,
    sortBy: "newest",
    sortOrder: "desc",
  });

  const related = (data?.data ?? []).filter((item: Treatment) => item.id !== excludeId).slice(0, 3);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold">Related Services</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <TreatmentCard key={item.id} treatment={item} clinicSlug={clinicSlug} />
        ))}
      </div>
    </div>
  );
}

function ItemDetailContent() {
  const params = useParams();
  const id = String(params.id);
  const searchParams = useSearchParams();
  const { data: me, isLoading: isMeLoading } = useMe();

  // Same resolution order as /items (see lib/publicClinic.ts) - an explicit
  // query param resolves immediately; otherwise wait for auth state to
  // settle so a logged-in user's own clinic is preferred over the fallback.
  const clinicFromUrl = searchParams.get("clinic")?.trim();
  const clinicSlug = clinicFromUrl
    ? resolveClinicSlug({ queryClinic: clinicFromUrl })
    : isMeLoading
      ? undefined
      : resolveClinicSlug({ userClinicSlug: me?.clinic.slug });

  const {
    data: treatment,
    isLoading,
    isError,
  } = useTreatment(id, { clinicSlug, enabled: Boolean(clinicSlug) });

  const backHref = clinicSlug ? `/items?clinic=${encodeURIComponent(clinicSlug)}` : "/items";

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link href={backHref} className="text-sm text-zinc-500 hover:underline">
          ← Back to services
        </Link>

        {!clinicSlug && (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-64 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        )}

        {clinicSlug && isLoading && (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-64 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        )}

        {clinicSlug && isError && (
          <div className="mt-8 text-center text-zinc-600 dark:text-zinc-400">
            This service could not be found.
          </div>
        )}

        {clinicSlug && !isLoading && !isError && treatment && (
          <>
            <article className="mt-6">
              <div className="h-64 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <TreatmentImage
                  src={treatment.imageUrl}
                  alt={treatment.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-6 inline-block text-xs font-medium uppercase tracking-wide text-zinc-500">
                {treatment.category}
              </span>
              <h1 className="text-2xl font-semibold">{treatment.title}</h1>

              <section aria-labelledby="overview-heading" className="mt-6">
                <h2 id="overview-heading" className="text-lg font-semibold">
                  Service Overview
                </h2>
                <p className="mt-2 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                  {treatment.fullDescription}
                </p>
              </section>

              <section
                aria-labelledby="key-info-heading"
                className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h2
                  id="key-info-heading"
                  className="text-sm font-medium uppercase tracking-wide text-zinc-500"
                >
                  Key Information
                </h2>
                <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">Price</dt>
                    <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      ${treatment.price.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">Duration</dt>
                    <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      {treatment.durationMinutes} min
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">Category</dt>
                    <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      {treatment.category}
                    </dd>
                  </div>
                </dl>
              </section>
            </article>

            <RelatedServices
              clinicSlug={clinicSlug}
              category={treatment.category}
              excludeId={treatment.id}
            />
          </>
        )}
      </div>
    </PublicLayout>
  );
}

export default function ItemDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-32">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      }
    >
      <ItemDetailContent />
    </Suspense>
  );
}
