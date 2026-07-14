"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useLoginMutation } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { loginFormSchema, type LoginFormValues } from "@/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
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

  return (
    <PublicLayout>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to your DentFlow dashboard.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-4">
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
