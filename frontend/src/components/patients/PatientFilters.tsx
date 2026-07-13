"use client";

export interface PatientFiltersValue {
  search: string;
  sortBy: "name" | "newest";
  sortOrder: "asc" | "desc";
}

const selectClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function PatientFilters({
  value,
  onChange,
}: {
  value: PatientFiltersValue;
  onChange: (value: PatientFiltersValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search patients..."
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        className="min-w-[180px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <select
        value={`${value.sortBy}:${value.sortOrder}`}
        onChange={(event) => {
          const [sortBy, sortOrder] = event.target.value.split(":") as [
            PatientFiltersValue["sortBy"],
            PatientFiltersValue["sortOrder"],
          ];
          onChange({ ...value, sortBy, sortOrder });
        }}
        className={selectClasses}
      >
        <option value="newest:desc">Newest first</option>
        <option value="newest:asc">Oldest first</option>
        <option value="name:asc">Name: A-Z</option>
        <option value="name:desc">Name: Z-A</option>
      </select>
    </div>
  );
}
