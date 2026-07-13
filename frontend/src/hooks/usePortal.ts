"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPortalAppointments,
  getPortalMe,
  type ListPortalAppointmentsParams,
} from "@/lib/api/portalApi";
import { getToken } from "@/lib/auth/token";

const PORTAL_KEY = "portal";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function usePortalMe() {
  return useQuery({
    queryKey: [PORTAL_KEY, "me"],
    queryFn: () => getPortalMe(requireToken()),
    enabled: Boolean(getToken()),
    retry: false,
  });
}

export function usePortalAppointments(params: ListPortalAppointmentsParams) {
  return useQuery({
    queryKey: [PORTAL_KEY, "appointments", params],
    queryFn: () => getPortalAppointments(params, requireToken()),
    enabled: Boolean(getToken()),
    placeholderData: (previousData) => previousData,
  });
}
