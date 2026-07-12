"use client";

import { TREATMENT_CATEGORIES, type TreatmentCategory } from "@/lib/api/treatmentsApi";

export interface TreatmentFiltersValue {
  search: string;
  category: TreatmentCategory | "";
  minPrice: string;
  maxPrice: string;
  sortBy: "price" | "title" | "newest";
  sortOrder: "asc" | "desc";
}

const selectClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function TreatmentFilters({
  value,
  onChange,
}: {
  value: TreatmentFiltersValue;
  onChange: (value: TreatmentFiltersValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search services..."
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        className="min-w-[180px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <select
        value={value.category}
        onChange={(event) =>
          onChange({ ...value, category: event.target.value as TreatmentCategory | "" })
        }
        className={selectClasses}
      >
        <option value="">All categories</option>
        {TREATMENT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Min price"
        value={value.minPrice}
        onChange={(event) => onChange({ ...value, minPrice: event.target.value })}
        className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        type="number"
        placeholder="Max price"
        value={value.maxPrice}
        onChange={(event) => onChange({ ...value, maxPrice: event.target.value })}
        className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <select
        value={`${value.sortBy}:${value.sortOrder}`}
        onChange={(event) => {
          const [sortBy, sortOrder] = event.target.value.split(":") as [
            TreatmentFiltersValue["sortBy"],
            TreatmentFiltersValue["sortOrder"],
          ];
          onChange({ ...value, sortBy, sortOrder });
        }}
        className={selectClasses}
      >
        <option value="newest:desc">Newest first</option>
        <option value="price:asc">Price: low to high</option>
        <option value="price:desc">Price: high to low</option>
        <option value="title:asc">Title: A-Z</option>
        <option value="title:desc">Title: Z-A</option>
      </select>
    </div>
  );
}
