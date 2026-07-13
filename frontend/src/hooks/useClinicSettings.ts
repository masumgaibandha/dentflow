"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClinicSettings,
  updateClinicSettings,
  type UpdateClinicSettingsInput,
} from "@/lib/api/clinicSettingsApi";
import { getToken } from "@/lib/auth/token";

const CLINIC_SETTINGS_KEY = "clinicSettings";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function useClinicSettings(clinicId?: string) {
  return useQuery({
    queryKey: [CLINIC_SETTINGS_KEY, clinicId],
    queryFn: () => getClinicSettings(requireToken()),
    enabled: Boolean(clinicId),
  });
}

export function useUpdateClinicSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClinicSettingsInput) => updateClinicSettings(input, requireToken()),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [CLINIC_SETTINGS_KEY] }),
        // The clinic name shown in DashboardShell's header comes from `me`.
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        // Dashboard's "today"/"this month" boundaries depend on clinic.timezone.
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
