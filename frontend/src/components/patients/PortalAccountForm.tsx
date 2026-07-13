"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  createPortalAccountFormSchema,
  type CreatePortalAccountFormValues,
} from "@/validators/portalAccount";

export function PortalAccountForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: CreatePortalAccountFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePortalAccountFormValues>({
    resolver: zodResolver(createPortalAccountFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        This creates the patient&apos;s portal login directly - no email is sent. Share the
        initial password with them yourself.
      </p>

      <FormField label="Login email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClasses} />
      </FormField>

      <FormField label="Initial password" error={errors.initialPassword?.message}>
        <input type="password" {...register("initialPassword")} className={inputClasses} />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Creating..." : "Create portal account"}
      </button>
    </form>
  );
}
