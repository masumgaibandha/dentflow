import { apiFetch } from "@/lib/api/client";

export const MEDICAL_RECORD_TYPES = [
  "consultation",
  "diagnosis",
  "procedure_note",
  "follow_up",
  "other",
] as const;

export type MedicalRecordType = (typeof MEDICAL_RECORD_TYPES)[number];

export const MEDICAL_RECORD_STATUSES = ["draft", "finalized"] as const;

export type MedicalRecordStatus = (typeof MEDICAL_RECORD_STATUSES)[number];

export interface MedicalRecordPatientRef {
  id: string;
  name: string | null;
}

export interface MedicalRecordAppointmentRef {
  id: string;
  startTime: string | null;
}

export interface MedicalRecordDentistRef {
  id: string;
  name: string | null;
}

export interface MedicalRecordAuthorRef {
  name: string | null;
}

export interface MedicalRecordListItem {
  id: string;
  patient: MedicalRecordPatientRef;
  appointment: MedicalRecordAppointmentRef | null;
  attendingDentist: MedicalRecordDentistRef | null;
  author: MedicalRecordAuthorRef;
  recordType: MedicalRecordType;
  title: string;
  recordDate: string;
  status: MedicalRecordStatus;
  finalizedAt: string | null;
  isAmendment: boolean;
  createdAt: string;
}

export interface MedicalRecordAmendmentSummary {
  id: string;
  title: string;
  recordDate: string;
  amendmentReason: string | null;
  author: MedicalRecordAuthorRef;
  createdAt: string;
}

export interface MedicalRecordDetail extends MedicalRecordListItem {
  description: string;
  amendmentReason: string | null;
  amendedRecord: { id: string; title: string; recordDate: string } | null;
  amendments: MedicalRecordAmendmentSummary[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListMedicalRecordsResponse {
  data: MedicalRecordListItem[];
  pagination: Pagination;
}

export interface ListMedicalRecordsParams {
  patientId: string;
  appointmentId?: string;
  attendingDentistId?: string;
  status?: MedicalRecordStatus;
  recordType?: MedicalRecordType;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params: ListMedicalRecordsParams): string {
  const query = new URLSearchParams();
  query.set("patientId", params.patientId);
  if (params.appointmentId) query.set("appointmentId", params.appointmentId);
  if (params.attendingDentistId) query.set("attendingDentistId", params.attendingDentistId);
  if (params.status) query.set("status", params.status);
  if (params.recordType) query.set("recordType", params.recordType);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return query.toString();
}

export function listMedicalRecords(
  params: ListMedicalRecordsParams,
  token: string,
): Promise<ListMedicalRecordsResponse> {
  const qs = buildQueryString(params);
  return apiFetch<ListMedicalRecordsResponse>(`/api/medical-records${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function getMedicalRecord(id: string, token: string): Promise<MedicalRecordDetail> {
  return apiFetch<MedicalRecordDetail>(`/api/medical-records/${id}`, {
    headers: authHeaders(token),
  });
}

export interface MedicalRecordInput {
  patientId: string;
  appointmentId?: string;
  attendingDentistId?: string;
  recordType: MedicalRecordType;
  title: string;
  description: string;
  recordDate?: string;
}

export function createMedicalRecord(
  input: MedicalRecordInput,
  token: string,
): Promise<MedicalRecordDetail> {
  return apiFetch<MedicalRecordDetail>("/api/medical-records", {
    method: "POST",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export interface UpdateMedicalRecordInput {
  appointmentId?: string;
  attendingDentistId?: string;
  recordType?: MedicalRecordType;
  title?: string;
  description?: string;
  recordDate?: string;
}

export function updateMedicalRecord(
  id: string,
  input: UpdateMedicalRecordInput,
  token: string,
): Promise<MedicalRecordDetail> {
  return apiFetch<MedicalRecordDetail>(`/api/medical-records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: authHeaders(token),
  });
}

export function deleteMedicalRecord(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/medical-records/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function finalizeMedicalRecord(id: string, token: string): Promise<MedicalRecordDetail> {
  return apiFetch<MedicalRecordDetail>(`/api/medical-records/${id}/finalize`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export interface CreateAmendmentInput {
  title: string;
  description: string;
  amendmentReason: string;
  recordDate?: string;
}

export function createAmendment(
  originalId: string,
  input: CreateAmendmentInput,
  idempotencyKey: string,
  token: string,
): Promise<MedicalRecordDetail> {
  return apiFetch<MedicalRecordDetail>(`/api/medical-records/${originalId}/amendments`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { ...authHeaders(token), "Idempotency-Key": idempotencyKey },
  });
}
