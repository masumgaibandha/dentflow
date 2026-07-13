import type { Dentist } from "@/lib/api/dentistsApi";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <span className="text-zinc-600 dark:text-zinc-400">{value}</span>
    </div>
  );
}

export function DentistDetails({ dentist }: { dentist: Dentist }) {
  return (
    <div className="flex flex-col gap-4">
      <Row label="Name" value={dentist.name} />
      <Row label="Specialty" value={dentist.specialty || "—"} />
      <Row label="Email" value={dentist.email || "—"} />
      <Row label="Phone" value={dentist.phone || "—"} />
      <Row label="Added on" value={new Date(dentist.createdAt).toLocaleDateString()} />
    </div>
  );
}
