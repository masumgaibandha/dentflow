import { apiFetch } from "@/lib/api/client";

export const INVOICE_STATUSES = ["unpaid", "paid", "void"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "mobile_banking"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface InvoiceLineItem {
  title: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface InvoicePatientRef {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceAppointmentRef {
  id: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export interface InvoicePayment {
  provider: "manual";
  method: PaymentMethod;
  paidAt: string;
  reference?: string;
}

export interface Invoice {
  id: string;
  clinicId: string;
  invoiceNumber: string;
  patient: InvoicePatientRef;
  appointment: InvoiceAppointmentRef | null;
  lineItems: InvoiceLineItem[];
  subtotalCents: number;
  totalCents: number;
  status: InvoiceStatus;
  payment: InvoicePayment | null;
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

export interface ListInvoicesResponse {
  data: Invoice[];
  pagination: Pagination;
}

export interface ListInvoicesParams {
  status?: InvoiceStatus;
  patientId?: string;
  appointmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "totalCents" | "invoiceNumber";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params: ListInvoicesParams): string {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.patientId) query.set("patientId", params.patientId);
  if (params.appointmentId) query.set("appointmentId", params.appointmentId);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listInvoices(
  params: ListInvoicesParams,
  token: string,
): Promise<ListInvoicesResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListInvoicesResponse>(`/api/invoices${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function getInvoice(id: string, token: string): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/invoices/${id}`, {
    headers: authHeaders(token),
  });
}

export interface LineItemInput {
  title: string;
  quantity: number;
  unitPriceCents: number;
}

export interface InvoiceInput {
  patientId: string;
  appointmentId?: string;
  lineItems: LineItemInput[];
  notes?: string;
}

export function createInvoice(input: InvoiceInput, token: string): Promise<Invoice> {
  return apiFetch<Invoice>("/api/invoices", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function updateInvoice(
  id: string,
  input: Partial<InvoiceInput>,
  token: string,
): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export interface MarkPaidInput {
  method: PaymentMethod;
  reference?: string;
}

export function markInvoicePaid(
  id: string,
  input: MarkPaidInput,
  token: string,
): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/invoices/${id}/mark-paid`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function voidInvoice(id: string, token: string): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/invoices/${id}/void`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export function deleteInvoice(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/invoices/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// Cents <-> major-unit (dollar) conversion helpers - the API boundary for all
// invoice monetary fields is cents (integers); forms work in dollars for display.
export function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
