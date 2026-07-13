"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
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

export function useTreatmentsList(params: Omit<ListTreatmentsParams, "token">) {
  return useQuery({
    queryKey: [TREATMENTS_KEY, PUBLIC_SCOPE, "list", params],
    queryFn: () => listTreatments(params),

    // Do not call the public API until a clinic slug exists.
    enabled: Boolean(params.clinicSlug),

    placeholderData: (previousData) => previousData,
  });
}

export function useTreatment(
  id: string,
  opts: {
    clinicSlug?: string;
    enabled?: boolean;
  } = {},
) {
  return useQuery({
    queryKey: [TREATMENTS_KEY, PUBLIC_SCOPE, "detail", id, opts.clinicSlug],
    queryFn: () =>
      getTreatment(id, {
        clinicSlug: opts.clinicSlug,
      }),
    enabled: (opts.enabled ?? true) && Boolean(id) && Boolean(opts.clinicSlug),
  });
}

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
    mutationFn: (input: TreatmentInput) =>
      createTreatment(input, requireToken()),
    onSuccess: async () => invalidateTreatmentQueries(queryClient),
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TreatmentInput>;
    }) => updateTreatment(id, input, requireToken()),
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
