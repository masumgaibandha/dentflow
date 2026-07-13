"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/api/dashboardApi";
import { getToken } from "@/lib/auth/token";

const DASHBOARD_KEY = "dashboard";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function useDashboardSummary(clinicId?: string) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "summary", clinicId],
    queryFn: () => getDashboardSummary(requireToken()),
    enabled: Boolean(clinicId),
  });
}
