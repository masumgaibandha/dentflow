"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { TreatmentCard } from "@/components/treatments/TreatmentCard";
import {
  TreatmentFilters,
  type TreatmentFiltersValue,
} from "@/components/treatments/TreatmentFilters";
import { Pagination } from "@/components/ui/Pagination";
import { TreatmentCardSkeleton } from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/useAuth";
import { useTreatmentsList } from "@/hooks/useTreatments";

const DEFAULT_FILTERS: TreatmentFiltersValue = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "newest",
  sortOrder: "desc",
};

function ItemsExploreContent() {
  const searchParams = useSearchParams();
  const { data: me, isLoading: isMeLoading } = useMe();

  // URL clinic always has first priority.
  // When no clinic exists in the URL, use the logged-in user's clinic.
  const clinicFromUrl = searchParams.get("clinic")?.trim();
  const clinicSlug = clinicFromUrl || me?.clinic.slug;

  const [filters, setFilters] =
    useState<TreatmentFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      clinicSlug,
      search: filters.search || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page,
      limit: 12,
    }),
    [clinicSlug, filters, page],
  );

  const { data, isLoading, isError, refetch } = useTreatmentsList(queryParams);

  function handleFiltersChange(next: TreatmentFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Our Dental Services</h1>

        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Browse our full range of treatments and pricing.
        </p>

        {clinicSlug && (
          <div className="mt-6">
            <TreatmentFilters value={filters} onChange={handleFiltersChange} />
          </div>
        )}

        {!clinicSlug && isMeLoading && (
          <div className="mt-12 text-center text-zinc-500">
            Loading clinic...
          </div>
        )}

        {!clinicSlug && !isMeLoading && (
          <div className="mt-12 rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            No clinic was specified. Open the public catalog using{" "}
            <code>?clinic=your-clinic-slug</code>.
          </div>
        )}

        {clinicSlug && isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <TreatmentCardSkeleton key={index} />
            ))}
          </div>
        )}

        {clinicSlug && isError && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Something went wrong loading services.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Try again
            </button>
          </div>
        )}

        {clinicSlug &&
          !isLoading &&
          !isError &&
          data &&
          data.data.length === 0 && (
            <div className="mt-12 text-center text-zinc-500">
              No services match your filters.
            </div>
          )}

        {clinicSlug &&
          !isLoading &&
          !isError &&
          data &&
          data.data.length > 0 && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data.data.map((treatment) => (
                  <TreatmentCard
                    key={treatment.id}
                    treatment={treatment}
                    clinicSlug={clinicSlug}
                  />
                ))}
              </div>

              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
      </div>
    </PublicLayout>
  );
}

export default function ItemsExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-32">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      }
    >
      <ItemsExploreContent />
    </Suspense>
  );
}
