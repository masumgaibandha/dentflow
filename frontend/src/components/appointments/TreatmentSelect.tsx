"use client";

import { useState } from "react";
import { inputClasses } from "@/components/ui/FormField";
import { useMe } from "@/hooks/useAuth";
import { useAdminTreatmentsList } from "@/hooks/useTreatments";

export function TreatmentSelect({
  selectedLabel,
  onSelect,
  onClear,
}: {
  selectedLabel: string;
  onSelect: (treatment: { id: string; title: string; durationMinutes: number }) => void;
  onClear: () => void;
}) {
  const { data: me } = useMe();
  const [query, setQuery] = useState(selectedLabel);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useAdminTreatmentsList(
    { search: query || undefined, sortBy: "title", sortOrder: "asc", limit: 10 },
    me?.clinic.id,
  );

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          placeholder="Search treatments (optional)..."
          className={`${inputClasses} w-full`}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
        />
        {selectedLabel && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onClear();
              setQuery("");
            }}
            className="rounded-md border border-zinc-300 px-2.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {isLoading && <div className="p-2 text-sm text-zinc-500">Searching...</div>}
          {!isLoading && (data?.data.length ?? 0) === 0 && (
            <div className="p-2 text-sm text-zinc-500">No treatments found.</div>
          )}
          {!isLoading &&
            data?.data.map((treatment) => (
              <button
                type="button"
                key={treatment.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect({
                    id: treatment.id,
                    title: treatment.title,
                    durationMinutes: treatment.durationMinutes,
                  });
                  setQuery(treatment.title);
                  setIsOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {treatment.title}
                <span className="ml-2 text-xs text-zinc-500">{treatment.durationMinutes} min</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
