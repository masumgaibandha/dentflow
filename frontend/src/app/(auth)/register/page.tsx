"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useRegisterMutation } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { registerFormSchema, type RegisterFormValues } from "@/validators/auth";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await registerMutation.mutateAsync(values);
        toast.success("Clinic registered successfully. Please log in.");
        router.push("/login");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    () => {
      toast.error("Please fix the highlighted fields.");
    },
  );

  return (
    <PublicLayout>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold">Register your clinic</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create an admin account to start managing your practice.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-4">
          <FormField label="Clinic name" error={errors.clinicName?.message}>
            <input {...register("clinicName")} className={inputClasses} autoComplete="organization" />
          </FormField>
          <FormField label="Your name" error={errors.adminName?.message}>
            <input {...register("adminName")} className={inputClasses} autoComplete="name" />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input type="email" {...register("email")} className={inputClasses} autoComplete="email" />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              {...register("password")}
              className={inputClasses}
              autoComplete="new-password"
            />
          </FormField>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline">
            Log in
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
