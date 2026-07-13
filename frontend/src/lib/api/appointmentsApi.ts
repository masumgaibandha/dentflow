import { apiFetch } from "@/lib/api/client";

export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface AppointmentPatientRef {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface AppointmentDentistRef {
  id: string;
  name?: string;
  specialty?: string;
}

export interface AppointmentTreatmentRef {
  id: string;
  title?: string;
  durationMinutes?: number;
  price?: number;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patient: AppointmentPatientRef;
  dentist: AppointmentDentistRef;
  treatment: AppointmentTreatmentRef | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
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

export interface ListAppointmentsResponse {
  data: Appointment[];
  pagination: Pagination;
}

export interface ListAppointmentsParams {
  dateFrom?: string;
  dateTo?: string;
  patientId?: string;
  dentistId?: string;
  status?: AppointmentStatus;
  sortBy?: "startTime" | "newest";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params: ListAppointmentsParams): string {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.patientId) query.set("patientId", params.patientId);
  if (params.dentistId) query.set("dentistId", params.dentistId);
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listAppointments(
  params: ListAppointmentsParams,
  token: string,
): Promise<ListAppointmentsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListAppointmentsResponse>(`/api/appointments${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function getAppointment(id: string, token: string): Promise<Appointment> {
  return apiFetch<Appointment>(`/api/appointments/${id}`, {
    headers: authHeaders(token),
  });
}

export interface AppointmentInput {
  patientId: string;
  dentistId: string;
  treatmentId?: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  notes?: string;
}

export function createAppointment(input: AppointmentInput, token: string): Promise<Appointment> {
  return apiFetch<Appointment>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function updateAppointment(
  id: string,
  input: Partial<AppointmentInput>,
  token: string,
): Promise<Appointment> {
  return apiFetch<Appointment>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function cancelAppointment(id: string, token: string): Promise<Appointment> {
  return apiFetch<Appointment>(`/api/appointments/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export function deleteAppointment(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/appointments/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
