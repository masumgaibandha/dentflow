import { apiFetch } from "@/lib/api/client";
import type { Weekday } from "@/lib/weekdays";

export interface DayHours {
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export type WeeklyHours = Record<Weekday, DayHours>;

export interface ClinicSettings {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  // Absent entirely when the clinic has never configured hours - never
  // treated as "open 24/7" by anything that reads this.
  weeklyHours?: WeeklyHours;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClinicSettingsInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  weeklyHours?: WeeklyHours;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function getClinicSettings(token: string): Promise<ClinicSettings> {
  return apiFetch<ClinicSettings>("/api/clinics/me", {
    headers: authHeaders(token),
  });
}

export function updateClinicSettings(
  input: UpdateClinicSettingsInput,
  token: string,
): Promise<ClinicSettings> {
  return apiFetch<ClinicSettings>("/api/clinics/me", {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}
