import { apiFetch } from "@/lib/api/client";

export interface PortalMe {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  clinic: { name: string };
  portalEmail: string;
}

export function getPortalMe(token: string): Promise<PortalMe> {
  return apiFetch<PortalMe>("/api/portal/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type PortalAppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface PortalAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: PortalAppointmentStatus;
  dentist: { name: string } | null;
  treatment: { title: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPortalAppointmentsResponse {
  data: PortalAppointment[];
  pagination: Pagination;
}

export interface ListPortalAppointmentsParams {
  when?: "upcoming" | "past";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function buildQueryString(params: ListPortalAppointmentsParams): string {
  const query = new URLSearchParams();
  if (params.when) query.set("when", params.when);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function getPortalAppointments(
  params: ListPortalAppointmentsParams,
  token: string,
): Promise<ListPortalAppointmentsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListPortalAppointmentsResponse>(`/api/portal/appointments${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface PortalDentist {
  id: string;
  name: string;
  specialty: string | null;
}

export interface ListPortalDentistsResponse {
  data: PortalDentist[];
  pagination: Pagination;
}

export function getPortalDentists(token: string): Promise<ListPortalDentistsResponse> {
  return apiFetch<ListPortalDentistsResponse>("/api/portal/dentists?limit=100", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface PortalTreatment {
  id: string;
  title: string;
  durationMinutes: number;
  priceCents: number;
}

export interface ListPortalTreatmentsResponse {
  data: PortalTreatment[];
  pagination: Pagination;
}

export function getPortalTreatments(token: string): Promise<ListPortalTreatmentsResponse> {
  return apiFetch<ListPortalTreatmentsResponse>("/api/portal/treatments?limit=100", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface CreatePortalAppointmentInput {
  dentistId: string;
  treatmentId: string;
  // Unambiguous ISO instant (e.g. via `new Date(...).toISOString()`) - never
  // a bare local-time string, matching the existing admin appointment module.
  startTime: string;
}

export function createPortalAppointment(
  input: CreatePortalAppointmentInput,
  idempotencyKey: string,
  token: string,
): Promise<PortalAppointment> {
  return apiFetch<PortalAppointment>("/api/portal/appointments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(input),
  });
}

export function cancelPortalAppointment(id: string, token: string): Promise<PortalAppointment> {
  return apiFetch<PortalAppointment>(`/api/portal/appointments/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type PortalInvoiceStatus = "unpaid" | "paid" | "void";
export type PortalPaymentMethod = "cash" | "card" | "bank_transfer" | "mobile_banking";

export interface PortalInvoiceListItem {
  id: string;
  invoiceNumber: string;
  totalCents: number;
  status: PortalInvoiceStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface PortalInvoiceLineItem {
  title: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface PortalInvoiceDetail {
  id: string;
  invoiceNumber: string;
  lineItems: PortalInvoiceLineItem[];
  subtotalCents: number;
  totalCents: number;
  status: PortalInvoiceStatus;
  payment: { method: PortalPaymentMethod; paidAt: string; reference?: string } | null;
  createdAt: string;
}

export interface ListPortalInvoicesResponse {
  data: PortalInvoiceListItem[];
  pagination: Pagination;
}

export interface ListPortalInvoicesParams {
  page?: number;
  limit?: number;
}

function buildInvoicesQueryString(params: ListPortalInvoicesParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function getPortalInvoices(
  params: ListPortalInvoicesParams,
  token: string,
): Promise<ListPortalInvoicesResponse> {
  const qs = buildInvoicesQueryString(params);
  return apiFetch<ListPortalInvoicesResponse>(`/api/portal/invoices${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getPortalInvoice(id: string, token: string): Promise<PortalInvoiceDetail> {
  return apiFetch<PortalInvoiceDetail>(`/api/portal/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface PortalPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export function createPortalInvoicePaymentIntent(
  invoiceId: string,
  token: string,
): Promise<PortalPaymentIntent> {
  return apiFetch<PortalPaymentIntent>(`/api/portal/invoices/${invoiceId}/payment-intent`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function verifyPortalInvoicePayment(
  invoiceId: string,
  paymentIntentId: string,
  token: string,
): Promise<PortalInvoiceDetail> {
  return apiFetch<PortalInvoiceDetail>(`/api/portal/invoices/${invoiceId}/verify-payment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paymentIntentId }),
  });
}
