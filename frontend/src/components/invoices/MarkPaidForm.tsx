"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { PAYMENT_METHODS } from "@/lib/api/invoicesApi";
import { markPaidFormSchema, type MarkPaidFormValues } from "@/validators/invoice";

export function MarkPaidForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: MarkPaidFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarkPaidFormValues>({
    resolver: zodResolver(markPaidFormSchema),
    defaultValues: { method: "cash" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="Payment method" error={errors.method?.message}>
        <select {...register("method")} className={inputClasses}>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method.replace("_", " ")}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Reference (optional)" error={errors.reference?.message}>
        <input
          {...register("reference")}
          className={inputClasses}
          placeholder="e.g. receipt or transaction number"
        />
      </FormField>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving..." : "Mark as paid"}
      </button>
    </form>
  );
}
