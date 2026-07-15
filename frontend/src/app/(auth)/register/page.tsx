"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useRegisterMutation } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { PASSWORD_REQUIREMENTS, registerFormSchema, type RegisterFormValues } from "@/validators/auth";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.63A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.14 3.9M6.6 6.6C3.87 8.36 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9.7 9.7 0 0 0 4.4-1.03" />
      <path d="M9.9 10.1a2.75 2.75 0 0 0 3.9 3.9" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.58l-1.3-1.3a1 1 0 0 0-1.4 1.42l2 2a1 1 0 0 0 1.4 0l4-4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="3" />
    </svg>
  );
}

function PasswordToggleButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      clinicName: "",
      adminName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        // Only the fields the API actually accepts - confirmPassword is a
        // frontend-only field and was never part of RegisterPayload.
        const { clinicName, adminName, email, password } = values;
        await registerMutation.mutateAsync({ clinicName, adminName, email, password });
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`${inputClasses} w-full pr-9`}
                autoComplete="new-password"
              />
              <PasswordToggleButton visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />
            </div>
          </FormField>

          <ul className="-mt-2 flex flex-col gap-1 text-xs" aria-label="Password requirements">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const met = requirement.test(passwordValue);
              return (
                <li
                  key={requirement.id}
                  className={`flex items-center gap-1.5 ${
                    met ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {met ? <CheckCircleIcon /> : <DotIcon />}
                  {requirement.label}
                </li>
              );
            })}
          </ul>

          <FormField label="Confirm password" error={errors.confirmPassword?.message}>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`${inputClasses} w-full pr-9`}
                autoComplete="new-password"
              />
              <PasswordToggleButton
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((value) => !value)}
              />
            </div>
          </FormField>

          <button
            type="submit"
            disabled={registerMutation.isPending || !isValid}
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
