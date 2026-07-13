"use client";

import { useState } from "react";
import { inputClasses } from "@/components/ui/FormField";
import { useMe } from "@/hooks/useAuth";
import { useDentistsList } from "@/hooks/useDentists";

export function DentistSelect({
  selectedLabel,
  onSelect,
}: {
  selectedLabel: string;
  onSelect: (dentist: { id: string; name: string }) => void;
}) {
  const { data: me } = useMe();
  const [query, setQuery] = useState(selectedLabel);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useDentistsList(
    { search: query || undefined, sortBy: "name", sortOrder: "asc", limit: 10 },
    me?.clinic.id,
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder="Search dentists by name..."
        className={`${inputClasses} w-full`}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {isLoading && <div className="p-2 text-sm text-zinc-500">Searching...</div>}
          {!isLoading && (data?.data.length ?? 0) === 0 && (
            <div className="p-2 text-sm text-zinc-500">No dentists found.</div>
          )}
          {!isLoading &&
            data?.data.map((dentist) => (
              <button
                type="button"
                key={dentist.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect({ id: dentist.id, name: dentist.name });
                  setQuery(dentist.name);
                  setIsOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {dentist.name}
                {dentist.specialty && (
                  <span className="ml-2 text-xs text-zinc-500">{dentist.specialty}</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
