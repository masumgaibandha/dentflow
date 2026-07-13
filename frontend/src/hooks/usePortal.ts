"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPortalInvoicePaymentIntent,
  getPortalAppointments,
  getPortalInvoice,
  getPortalInvoices,
  getPortalMe,
  verifyPortalInvoicePayment,
  type ListPortalAppointmentsParams,
  type ListPortalInvoicesParams,
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
