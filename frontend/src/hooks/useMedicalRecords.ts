"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAmendment,
  createMedicalRecord,
  deleteMedicalRecord,
  finalizeMedicalRecord,
  getMedicalRecord,
  listMedicalRecords,
  updateMedicalRecord,
  updateMedicalRecordVisibility,
  type CreateAmendmentInput,
  type ListMedicalRecordsParams,
  type MedicalRecordInput,
  type UpdateMedicalRecordInput,
} from "@/lib/api/medicalRecordsApi";
import { getToken } from "@/lib/auth/token";

const MEDICAL_RECORDS_KEY = "medical-records";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

function listKey(patientId: string, filters: Omit<ListMedicalRecordsParams, "patientId">) {
  return [MEDICAL_RECORDS_KEY, "list", patientId, filters] as const;
}

function detailKey(recordId: string) {
  return [MEDICAL_RECORDS_KEY, "detail", recordId] as const;
}

export function useMedicalRecordsList(params: ListMedicalRecordsParams, enabled = true) {
  const { patientId, ...filters } = params;

  return useQuery({
    queryKey: listKey(patientId, filters),
    queryFn: () => listMedicalRecords(params, requireToken()),
    enabled: enabled && Boolean(patientId),
    placeholderData: (previousData) => previousData,
  });
}

export function useMedicalRecord(id: string, enabled = true) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getMedicalRecord(id, requireToken()),
    enabled: enabled && Boolean(id),
  });
}

async function invalidatePatientRecords(
  queryClient: ReturnType<typeof useQueryClient>,
  patientId: string,
) {
  await queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_KEY, "list", patientId] });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MedicalRecordInput) => createMedicalRecord(input, requireToken()),
    onSuccess: async (result) => {
      await invalidatePatientRecords(queryClient, result.patient.id);
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMedicalRecordInput }) =>
      updateMedicalRecord(id, input, requireToken()),
    onSuccess: async (result) => {
      await Promise.all([
        invalidatePatientRecords(queryClient, result.patient.id),
        queryClient.invalidateQueries({ queryKey: detailKey(result.id) }),
      ]);
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; patientId: string }) => deleteMedicalRecord(id, requireToken()),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        invalidatePatientRecords(queryClient, variables.patientId),
        queryClient.invalidateQueries({ queryKey: detailKey(variables.id) }),
      ]);
    },
  });
}

export function useFinalizeMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => finalizeMedicalRecord(id, requireToken()),
    onSuccess: async (result) => {
      await Promise.all([
        invalidatePatientRecords(queryClient, result.patient.id),
        queryClient.invalidateQueries({ queryKey: detailKey(result.id) }),
      ]);
    },
  });
}

export function useUpdateMedicalRecordVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patientVisible }: { id: string; patientVisible: boolean }) =>
      updateMedicalRecordVisibility(id, patientVisible, requireToken()),
    onSuccess: async (result) => {
      await Promise.all([
        // Staff-side detail + the patient's staff-side list.
        queryClient.invalidateQueries({ queryKey: detailKey(result.id) }),
        invalidatePatientRecords(queryClient, result.patient.id),
        // The patient portal's own cache - a real cross-account effect only
        // matters within the same browser tab/session (e.g. during account
        // switching in dev/QA), but staying consistent with it is cheap and
        // was explicitly requested.
        queryClient.invalidateQueries({ queryKey: ["portal", "medical-records"] }),
      ]);
    },
  });
}

export function useCreateAmendment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      originalId,
      input,
      idempotencyKey,
    }: {
      originalId: string;
      input: CreateAmendmentInput;
      idempotencyKey: string;
    }) => createAmendment(originalId, input, idempotencyKey, requireToken()),
    onSuccess: async (result, variables) => {
      await Promise.all([
        invalidatePatientRecords(queryClient, result.patient.id),
        // The original record's detail view shows its amendments list, so it
        // must be invalidated too, not just the new amendment's own (as yet
        // unvisited) detail entry.
        queryClient.invalidateQueries({ queryKey: detailKey(variables.originalId) }),
        queryClient.invalidateQueries({ queryKey: detailKey(result.id) }),
      ]);
    },
  });
}
