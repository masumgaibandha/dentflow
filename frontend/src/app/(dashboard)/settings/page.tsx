"use client";

import { toast } from "sonner";
import { ClinicSettingsForm } from "@/components/settings/ClinicSettingsForm";
import { useMe } from "@/hooks/useAuth";
import { useClinicSettings, useUpdateClinicSettings } from "@/hooks/useClinicSettings";
import { getErrorMessage } from "@/lib/errors";
import type { WeeklyHours } from "@/lib/api/clinicSettingsApi";
import { WEEKDAYS } from "@/lib/weekdays";
import {
  DEFAULT_DAY_HOURS,
  type ClinicSettingsFormValues,
  type WeeklyHoursFormValues,
} from "@/validators/clinicSettings";

// Sensible starting draft for a clinic that has never configured hours -
// shown in the form for the admin to review/edit, never saved until they
// explicitly submit. Weekdays 9-5, weekend closed.
const STARTER_WEEKLY_HOURS: WeeklyHoursFormValues = {
  monday: DEFAULT_DAY_HOURS,
  tuesday: DEFAULT_DAY_HOURS,
  wednesday: DEFAULT_DAY_HOURS,
  thursday: DEFAULT_DAY_HOURS,
  friday: DEFAULT_DAY_HOURS,
  saturday: { isClosed: true, openTime: "09:00", closeTime: "17:00" },
  sunday: { isClosed: true, openTime: "09:00", closeTime: "17:00" },
};

function toFormWeeklyHours(weeklyHours: WeeklyHours | undefined): WeeklyHoursFormValues {
  if (!weeklyHours) {
    return STARTER_WEEKLY_HOURS;
  }
  return Object.fromEntries(
    WEEKDAYS.map((day) => [
      day,
      {
        isClosed: weeklyHours[day].isClosed,
        openTime: weeklyHours[day].openTime ?? "09:00",
        closeTime: weeklyHours[day].closeTime ?? "17:00",
      },
    ]),
  ) as WeeklyHoursFormValues;
}

function toApiWeeklyHours(weeklyHours: WeeklyHoursFormValues): WeeklyHours {
  return Object.fromEntries(
    WEEKDAYS.map((day) => {
      const value = weeklyHours[day];
      return [
        day,
        value.isClosed
          ? { isClosed: true }
          : { isClosed: false, openTime: value.openTime, closeTime: value.closeTime },
      ];
    }),
  ) as WeeklyHours;
}

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
        weeklyHours: toApiWeeklyHours(values.weeklyHours),
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
        Manage your clinic&apos;s profile, timezone, and operating hours.
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
              weeklyHours: toFormWeeklyHours(data.weeklyHours),
            }}
            slug={data.slug}
            hoursConfigured={Boolean(data.weeklyHours)}
            onSubmit={handleSubmit}
            isSubmitting={updateSettings.isPending}
          />
        )}
      </div>
    </div>
  );
}
