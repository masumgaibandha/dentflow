import { apiFetch } from "@/lib/api/client";

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPatientsResponse {
  data: Patient[];
  pagination: Pagination;
}

export interface ListPatientsParams {
  search?: string;
  sortBy?: "name" | "newest";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params: ListPatientsParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listPatients(
  params: ListPatientsParams,
  token: string,
): Promise<ListPatientsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListPatientsResponse>(`/api/patients${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function getPatient(id: string, token: string): Promise<Patient> {
  return apiFetch<Patient>(`/api/patients/${id}`, {
    headers: authHeaders(token),
  });
}

export interface PatientInput {
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  notes?: string;
}

export function createPatient(input: PatientInput, token: string): Promise<Patient> {
  return apiFetch<Patient>("/api/patients", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function updatePatient(
  id: string,
  input: Partial<PatientInput>,
  token: string,
): Promise<Patient> {
  return apiFetch<Patient>(`/api/patients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function deletePatient(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/patients/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
