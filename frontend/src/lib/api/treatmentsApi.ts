import { apiFetch } from "@/lib/api/client";

export const TREATMENT_CATEGORIES = [
  "Preventive",
  "Restorative",
  "Cosmetic",
  "Orthodontic",
  "Surgical",
  "Pediatric",
] as const;

export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];

export interface Treatment {
  id: string;
  clinicId: string;
  imageUrl?: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  durationMinutes: number;
  category: TreatmentCategory;
  // Backward-compatible, same convention as the backend's own active-record
  // queries: absent/undefined means active, only `false` means inactive.
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListTreatmentsResponse {
  data: Treatment[];
  pagination: Pagination;
}

export interface ListTreatmentsParams {
  clinicSlug?: string;
  search?: string;
  category?: TreatmentCategory;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "title" | "newest";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  token?: string;
}

function authHeaders(token?: string): HeadersInit | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function buildQueryString(params: ListTreatmentsParams): string {
  const query = new URLSearchParams();
  if (params.clinicSlug) query.set("clinic", params.clinicSlug);
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listTreatments(
  params: ListTreatmentsParams = {},
): Promise<ListTreatmentsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListTreatmentsResponse>(`/api/treatments${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(params.token),
  });
}

export function listAdminTreatments(
  params: Omit<ListTreatmentsParams, "clinicSlug" | "token">,
  token: string,
): Promise<ListTreatmentsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListTreatmentsResponse>(`/api/treatments/admin${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function getTreatment(
  id: string,
  opts: { clinicSlug?: string; token?: string } = {},
): Promise<Treatment> {
  const qs = opts.clinicSlug ? `?clinic=${encodeURIComponent(opts.clinicSlug)}` : "";
  return apiFetch<Treatment>(`/api/treatments/${id}${qs}`, {
    headers: authHeaders(opts.token),
  });
}

export interface TreatmentInput {
  imageUrl?: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  durationMinutes: number;
  category: TreatmentCategory;
}

export function createTreatment(input: TreatmentInput, token: string): Promise<Treatment> {
  return apiFetch<Treatment>("/api/treatments", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function updateTreatment(
  id: string,
  input: Partial<TreatmentInput>,
  token: string,
): Promise<Treatment> {
  return apiFetch<Treatment>(`/api/treatments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function deleteTreatment(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/treatments/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
