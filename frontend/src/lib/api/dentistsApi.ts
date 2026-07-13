import { apiFetch } from "@/lib/api/client";

export interface Dentist {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListDentistsResponse {
  data: Dentist[];
  pagination: Pagination;
}

export interface ListDentistsParams {
  search?: string;
  sortBy?: "name" | "newest";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params: ListDentistsParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listDentists(
  params: ListDentistsParams,
  token: string,
): Promise<ListDentistsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListDentistsResponse>(`/api/dentists${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function getDentist(id: string, token: string): Promise<Dentist> {
  return apiFetch<Dentist>(`/api/dentists/${id}`, {
    headers: authHeaders(token),
  });
}

export interface DentistInput {
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
}

export function createDentist(input: DentistInput, token: string): Promise<Dentist> {
  return apiFetch<Dentist>("/api/dentists", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function updateDentist(
  id: string,
  input: Partial<DentistInput>,
  token: string,
): Promise<Dentist> {
  return apiFetch<Dentist>(`/api/dentists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function deleteDentist(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/dentists/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
