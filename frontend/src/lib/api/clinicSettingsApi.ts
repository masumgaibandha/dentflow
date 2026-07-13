import { apiFetch } from "@/lib/api/client";

export interface ClinicSettings {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClinicSettingsInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
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
