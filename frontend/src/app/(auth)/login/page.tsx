"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useLoginMutation } from "@/hooks/useAuth";
import { DEMO_ACCOUNTS } from "@/lib/demoAccounts";
import { getErrorMessage } from "@/lib/errors";
import { loginFormSchema, type LoginFormValues } from "@/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const result = await loginMutation.mutateAsync(values);
        toast.success("Logged in successfully.");
        const destination =
          result.user.role === "patient"
            ? "/portal"
            : result.user.role === "staff"
              ? "/appointments"
              : "/dashboard";
        router.push(destination);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    () => {
      toast.error("Please fix the highlighted fields.");
    },
  );

  function fillDemoAccount(email: string, password: string) {
    // Fills the existing fields only - never auto-submits. The visitor
    // reviews the credentials and clicks Log in themselves, same as if
    // they'd typed them.
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to your DentFlow dashboard.
        </p>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
            Try DentFlow instantly with a demo account
          </p>
          <p className="mt-1 text-xs text-blue-800 dark:text-blue-300">
            These accounts contain demonstration data only - do not reuse them for a real clinic.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemoAccount(account.email, account.password)}
                className="flex flex-col items-start rounded-md border border-blue-300 bg-white px-3 py-2 text-left text-xs hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-blue-800 dark:bg-zinc-900 dark:hover:bg-blue-900/40"
              >
                <span className="font-semibold text-blue-900 dark:text-blue-200">{account.label}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{account.description}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <FormField label="Email" error={errors.email?.message}>
            <input type="email" {...register("email")} className={inputClasses} autoComplete="email" />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              {...register("password")}
              className={inputClasses}
              autoComplete="current-password"
            />
          </FormField>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loginMutation.isPending ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have a clinic account yet?{" "}
          <Link href="/register" className="font-medium underline">
            Register
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
