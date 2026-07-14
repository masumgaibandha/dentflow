"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPortalAppointment,
  createPortalAppointment,
  createPortalInvoicePaymentIntent,
  getPortalAppointments,
  getPortalAvailableSlots,
  getPortalDentists,
  getPortalInvoice,
  getPortalInvoices,
  getPortalMe,
  getPortalMedicalRecord,
  getPortalMedicalRecords,
  getPortalTreatments,
  verifyPortalInvoicePayment,
  type CreatePortalAppointmentInput,
  type ListPortalAppointmentsParams,
  type ListPortalInvoicesParams,
  type ListPortalMedicalRecordsParams,
} from "@/lib/api/portalApi";
import { getToken } from "@/lib/auth/token";

const PORTAL_KEY = "portal";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function usePortalMe() {
  return useQuery({
    queryKey: [PORTAL_KEY, "me"],
    queryFn: () => getPortalMe(requireToken()),
    enabled: Boolean(getToken()),
    retry: false,
  });
}

export function usePortalAppointments(params: ListPortalAppointmentsParams) {
  return useQuery({
    queryKey: [PORTAL_KEY, "appointments", params],
    queryFn: () => getPortalAppointments(params, requireToken()),
    enabled: Boolean(getToken()),
    placeholderData: (previousData) => previousData,
  });
}

export function usePortalDentists() {
  return useQuery({
    queryKey: [PORTAL_KEY, "dentists"],
    queryFn: () => getPortalDentists(requireToken()),
    enabled: Boolean(getToken()),
  });
}

export function usePortalTreatments() {
  return useQuery({
    queryKey: [PORTAL_KEY, "treatments"],
    queryFn: () => getPortalTreatments(requireToken()),
    enabled: Boolean(getToken()),
  });
}

// Only fetched once dentist, treatment, and date are all chosen - the query
// key includes all three so switching any one of them fetches a fresh list
// rather than reusing a stale cached result for the old combination.
export function usePortalAvailableSlots(dentistId: string, treatmentId: string, date: string) {
  return useQuery({
    queryKey: [PORTAL_KEY, "available-slots", dentistId, treatmentId, date],
    queryFn: () => getPortalAvailableSlots({ dentistId, treatmentId, date }, requireToken()),
    enabled: Boolean(getToken()) && Boolean(dentistId) && Boolean(treatmentId) && Boolean(date),
  });
}

export function useCreatePortalAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: CreatePortalAppointmentInput;
      idempotencyKey: string;
    }) => createPortalAppointment(input, idempotencyKey, requireToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PORTAL_KEY, "appointments"] });
      queryClient.invalidateQueries({ queryKey: [PORTAL_KEY, "available-slots"] });
    },
  });
}

export function useCancelPortalAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelPortalAppointment(id, requireToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PORTAL_KEY, "appointments"] });
      queryClient.invalidateQueries({ queryKey: [PORTAL_KEY, "available-slots"] });
    },
  });
}

export function usePortalInvoicesList(params: ListPortalInvoicesParams) {
  return useQuery({
    queryKey: [PORTAL_KEY, "invoices", "list", params],
    queryFn: () => getPortalInvoices(params, requireToken()),
    enabled: Boolean(getToken()),
    placeholderData: (previousData) => previousData,
  });
}

export function usePortalInvoice(id: string) {
  return useQuery({
    queryKey: [PORTAL_KEY, "invoices", "detail", id],
    queryFn: () => getPortalInvoice(id, requireToken()),
    enabled: Boolean(getToken()) && Boolean(id),
  });
}

// clientSecret/paymentIntentId returned here are never written to the query
// cache, localStorage, sessionStorage, cookies, or the URL - callers must
// hold the result in component state only, for the lifetime of the payment
// form, and let it be discarded on unmount/navigation.
export function useCreatePortalPaymentIntent() {
  return useMutation({
    mutationFn: (invoiceId: string) => createPortalInvoicePaymentIntent(invoiceId, requireToken()),
  });
}

// Namespaced exactly as ["portal", "medical-records", "list"/"detail", ...] -
// the staff visibility mutation's cache invalidation (see
// useUpdateMedicalRecordVisibility in useMedicalRecords.ts) targets this same
// ["portal", "medical-records"] prefix.
export function usePortalMedicalRecordsList(params: ListPortalMedicalRecordsParams) {
  return useQuery({
    queryKey: [PORTAL_KEY, "medical-records", "list", params],
    queryFn: () => getPortalMedicalRecords(params, requireToken()),
    enabled: Boolean(getToken()),
    placeholderData: (previousData) => previousData,
  });
}

export function usePortalMedicalRecord(id: string) {
  return useQuery({
    queryKey: [PORTAL_KEY, "medical-records", "detail", id],
    queryFn: () => getPortalMedicalRecord(id, requireToken()),
    enabled: Boolean(getToken()) && Boolean(id),
  });
}

export function useVerifyPortalPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      paymentIntentId,
    }: {
      invoiceId: string;
      paymentIntentId: string;
    }) => verifyPortalInvoicePayment(invoiceId, paymentIntentId, requireToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PORTAL_KEY, "invoices"] });
    },
  });
}
