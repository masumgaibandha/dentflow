"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  createTreatment,
  deleteTreatment,
  getTreatment,
  listAdminTreatments,
  listTreatments,
  updateTreatment,
  type ListTreatmentsParams,
  type TreatmentInput,
} from "@/lib/api/treatmentsApi";
import { getToken } from "@/lib/auth/token";

const TREATMENTS_KEY = "treatments";
const PUBLIC_SCOPE = "public";
const ADMIN_SCOPE = "admin";

function requireToken(): string {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return token;
}

// Public Explore/Detail pages - resolves via clinic slug only. Never sends a
// session token, even if the visitor happens to be logged in, so it can never
// be confused with the admin-scoped queries below.
export function useTreatmentsList(params: Omit<ListTreatmentsParams, "token">) {
  return useQuery({
    queryKey: [TREATMENTS_KEY, PUBLIC_SCOPE, "list", params],
    queryFn: () => listTreatments(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useTreatment(id: string, opts: { clinicSlug?: string; enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [TREATMENTS_KEY, PUBLIC_SCOPE, "detail", id, opts.clinicSlug],
    queryFn: () => getTreatment(id, { clinicSlug: opts.clinicSlug }),
    enabled: opts.enabled ?? true,
  });
}

// Manage page only - always attaches the logged-in admin's session token
// itself (the caller never has to remember to pass one), so the backend
// always resolves via req.user.clinicId rather than any public clinic slug.
// Namespaced under a distinct "admin" key so it can never collide with, or be
// invalidated together with, the public queries above by accident.
export function useAdminTreatmentsList(
  params: Omit<ListTreatmentsParams, "clinicSlug" | "token">,
  clinicId?: string,
) {
  return useQuery({
    queryKey: [TREATMENTS_KEY, ADMIN_SCOPE, clinicId, "list", params],
    queryFn: () => listAdminTreatments(params, requireToken()),
    enabled: Boolean(clinicId),
    placeholderData: (previousData) => previousData,
  });
}

// Create/update/delete affect both: the admin's own manage list, and (if the
// admin also has their public catalog open in this same tab/session) their
// public catalog list and detail queries too.
async function invalidateTreatmentQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [TREATMENTS_KEY, ADMIN_SCOPE],
      refetchType: "all",
    }),
    queryClient.invalidateQueries({
      queryKey: [TREATMENTS_KEY, PUBLIC_SCOPE],
      refetchType: "all",
    }),
  ]);
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TreatmentInput) => createTreatment(input, requireToken()),
    onSuccess: async () => invalidateTreatmentQueries(queryClient),
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TreatmentInput> }) =>
      updateTreatment(id, input, requireToken()),
    onSuccess: async () => invalidateTreatmentQueries(queryClient),
  });
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTreatment(id, requireToken()),
    onSuccess: async () => invalidateTreatmentQueries(queryClient),
  });
}
