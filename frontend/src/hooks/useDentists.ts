"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDentist,
  deleteDentist,
  getDentist,
  listDentists,
  updateDentist,
  type DentistInput,
  type ListDentistsParams,
} from "@/lib/api/dentistsApi";
import { getToken } from "@/lib/auth/token";

const DENTISTS_KEY = "dentists";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function useDentistsList(params: ListDentistsParams, clinicId?: string) {
  return useQuery({
    queryKey: [DENTISTS_KEY, clinicId, "list", params],
    queryFn: () => listDentists(params, requireToken()),
    enabled: Boolean(clinicId),
    placeholderData: (previousData) => previousData,
  });
}

export function useDentist(id: string, enabled = true) {
  return useQuery({
    queryKey: [DENTISTS_KEY, "detail", id],
    queryFn: () => getDentist(id, requireToken()),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateDentist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DentistInput) => createDentist(input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [DENTISTS_KEY] });
    },
  });
}

export function useUpdateDentist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DentistInput> }) =>
      updateDentist(id, input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [DENTISTS_KEY] });
    },
  });
}

export function useDeleteDentist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDentist(id, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [DENTISTS_KEY] });
    },
  });
}
