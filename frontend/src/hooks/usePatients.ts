"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  updatePatient,
  type ListPatientsParams,
  type PatientInput,
} from "@/lib/api/patientsApi";
import { getToken } from "@/lib/auth/token";

const PATIENTS_KEY = "patients";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function usePatientsList(params: ListPatientsParams, clinicId?: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, clinicId, "list", params],
    queryFn: () => listPatients(params, requireToken()),
    enabled: Boolean(clinicId),
    placeholderData: (previousData) => previousData,
  });
}

export function usePatient(id: string, enabled = true) {
  return useQuery({
    queryKey: [PATIENTS_KEY, "detail", id],
    queryFn: () => getPatient(id, requireToken()),
    enabled: enabled && Boolean(id),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientInput) => createPatient(input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PatientInput> }) =>
      updatePatient(id, input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}
