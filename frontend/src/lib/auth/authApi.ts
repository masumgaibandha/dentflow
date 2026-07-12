import { apiFetch } from "@/lib/api/client";

export type UserRole = "admin" | "staff" | "patient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthClinic {
  id: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  clinic: AuthClinic;
}

export interface MeResponse {
  user: AuthUser;
  clinic: AuthClinic;
}

export interface RegisterPayload {
  clinicName: string;
  adminName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerClinic(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe(token: string): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
