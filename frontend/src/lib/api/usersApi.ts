import { apiFetch } from "@/lib/api/client";

export type UserRole = "admin" | "staff";

export interface ClinicUser {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUsersResponse {
  data: ClinicUser[];
  pagination: Pagination;
}

export interface ListUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params: ListUsersParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listUsers(params: ListUsersParams, token: string): Promise<ListUsersResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListUsersResponse>(`/api/users${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
}

export function createStaffUser(input: CreateStaffInput, token: string): Promise<ClinicUser> {
  return apiFetch<ClinicUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function updateUserStatus(
  id: string,
  isActive: boolean,
  token: string,
): Promise<ClinicUser> {
  return apiFetch<ClinicUser>(`/api/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
    headers: authHeaders(token),
  });
}
