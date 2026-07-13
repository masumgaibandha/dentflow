"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  getAppointment,
  listAppointments,
  updateAppointment,
  type AppointmentInput,
  type ListAppointmentsParams,
} from "@/lib/api/appointmentsApi";
import { getToken } from "@/lib/auth/token";

const APPOINTMENTS_KEY = "appointments";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function useAppointmentsList(params: ListAppointmentsParams, clinicId?: string) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, clinicId, "list", params],
    queryFn: () => listAppointments(params, requireToken()),
    enabled: Boolean(clinicId),
    placeholderData: (previousData) => previousData,
  });
}

export function useAppointment(id: string, enabled = true) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, "detail", id],
    queryFn: () => getAppointment(id, requireToken()),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AppointmentInput) => createAppointment(input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AppointmentInput> }) =>
      updateAppointment(id, input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}
