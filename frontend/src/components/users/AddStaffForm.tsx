"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { createStaffFormSchema, type CreateStaffFormValues } from "@/validators/staffUser";

export function AddStaffForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: CreateStaffFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        This creates a staff account directly - no email is sent. Share the initial password with
        them yourself.
      </p>

      <FormField label="Name" error={errors.name?.message}>
        <input {...register("name")} className={inputClasses} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClasses} />
      </FormField>

      <FormField label="Initial password" error={errors.password?.message}>
        <input type="password" {...register("password")} className={inputClasses} />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Adding..." : "Add staff account"}
      </button>
    </form>
  );
}
