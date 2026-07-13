"use client";

import { useState } from "react";
import { inputClasses } from "@/components/ui/FormField";
import { useMe } from "@/hooks/useAuth";
import { usePatientsList } from "@/hooks/usePatients";

export function PatientSelect({
  selectedLabel,
  onSelect,
}: {
  selectedLabel: string;
  onSelect: (patient: { id: string; name: string }) => void;
}) {
  const { data: me } = useMe();
  const [query, setQuery] = useState(selectedLabel);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = usePatientsList(
    { search: query || undefined, sortBy: "name", sortOrder: "asc", limit: 10 },
    me?.clinic.id,
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder="Search patients by name..."
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
            <div className="p-2 text-sm text-zinc-500">No patients found.</div>
          )}
          {!isLoading &&
            data?.data.map((patient) => (
              <button
                type="button"
                key={patient.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect({ id: patient.id, name: patient.name });
                  setQuery(patient.name);
                  setIsOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {patient.name}
                {patient.email && (
                  <span className="ml-2 text-xs text-zinc-500">{patient.email}</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
