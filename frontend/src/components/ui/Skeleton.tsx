export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

export function TreatmentCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TreatmentRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
    </tr>
  );
}

export function PatientRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
    </tr>
  );
}

export function MedicalRecordRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
    </tr>
  );
}

export function DentistRowSkeleton() {
  return (
    <tr>
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-28" />
      </td>
    </tr>
  );
}
