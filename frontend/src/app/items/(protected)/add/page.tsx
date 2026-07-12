"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TreatmentForm } from "@/components/treatments/TreatmentForm";
import { useCreateTreatment } from "@/hooks/useTreatments";
import { getErrorMessage } from "@/lib/errors";
import type { TreatmentFormValues } from "@/validators/treatment";

export default function AddTreatmentPage() {
  const router = useRouter();
  const createTreatment = useCreateTreatment();

  async function handleSubmit(values: TreatmentFormValues) {
    try {
      await createTreatment.mutateAsync(values);
      toast.success("Service created successfully.");
      router.push("/items/manage");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-2xl font-semibold">Add a service</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Add a new treatment to your public catalog.
      </p>
      <div className="mt-8">
        <TreatmentForm
          onSubmit={handleSubmit}
          isSubmitting={createTreatment.isPending}
          submitLabel="Create service"
        />
      </div>
    </div>
  );
}
