"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useMe } from "@/hooks/useAuth";
import { useTreatment } from "@/hooks/useTreatments";
import { resolveClinicSlug } from "@/lib/publicClinic";

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
          <article className="mt-6">
            <div className="h-64 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied image URL */}
              <img
                src={treatment.imageUrl}
                alt={treatment.title}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="mt-6 inline-block text-xs font-medium uppercase tracking-wide text-zinc-500">
              {treatment.category}
            </span>
            <h1 className="text-2xl font-semibold">{treatment.title}</h1>
            <div className="mt-2 flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                ${treatment.price.toFixed(2)}
              </span>
              <span>{treatment.durationMinutes} min</span>
            </div>
            <p className="mt-6 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
              {treatment.fullDescription}
            </p>
          </article>
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
