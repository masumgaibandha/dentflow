"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  markInvoicePaid,
  updateInvoice,
  voidInvoice,
  type InvoiceInput,
  type ListInvoicesParams,
  type MarkPaidInput,
} from "@/lib/api/invoicesApi";
import { getToken } from "@/lib/auth/token";

const INVOICES_KEY = "invoices";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function useInvoicesList(params: ListInvoicesParams, clinicId?: string) {
  return useQuery({
    queryKey: [INVOICES_KEY, clinicId, "list", params],
    queryFn: () => listInvoices(params, requireToken()),
    enabled: Boolean(clinicId),
    placeholderData: (previousData) => previousData,
  });
}

export function useInvoice(id: string, enabled = true) {
  return useQuery({
    queryKey: [INVOICES_KEY, "detail", id],
    queryFn: () => getInvoice(id, requireToken()),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InvoiceInput) => createInvoice(input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<InvoiceInput> }) =>
      updateInvoice(id, input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MarkPaidInput }) =>
      markInvoicePaid(id, input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voidInvoice(id, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}
