"use client";

import { toast } from "sonner";
import { ClinicSettingsForm } from "@/components/settings/ClinicSettingsForm";
import { useMe } from "@/hooks/useAuth";
import { useClinicSettings, useUpdateClinicSettings } from "@/hooks/useClinicSettings";
import { getErrorMessage } from "@/lib/errors";
import type { ClinicSettingsFormValues } from "@/validators/clinicSettings";

export default function SettingsPage() {
  const { data: me } = useMe();
  const { data, isLoading, isError, refetch } = useClinicSettings(me?.clinic.id);
  const updateSettings = useUpdateClinicSettings();

  async function handleSubmit(values: ClinicSettingsFormValues) {
    try {
      await updateSettings.mutateAsync({
        name: values.name,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        timezone: values.timezone || undefined,
      });
      toast.success("Clinic settings saved.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Clinic settings</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Manage your clinic&apos;s profile and timezone.
      </p>

      <div className="mt-6 max-w-lg">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-12 text-center dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              Something went wrong loading clinic settings.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <ClinicSettingsForm
            defaultValues={{
              name: data.name,
              address: data.address ?? "",
              phone: data.phone ?? "",
              email: data.email ?? "",
              timezone: data.timezone ?? "",
            }}
            slug={data.slug}
            onSubmit={handleSubmit}
            isSubmitting={updateSettings.isPending}
          />
        )}
      </div>
    </div>
  );
}
