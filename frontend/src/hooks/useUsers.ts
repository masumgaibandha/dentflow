"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStaffUser,
  listUsers,
  updateUserStatus,
  type CreateStaffInput,
  type ListUsersParams,
} from "@/lib/api/usersApi";
import { getToken } from "@/lib/auth/token";

const USERS_KEY = "clinicUsers";

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

export function useUsersList(params: ListUsersParams, clinicId?: string) {
  return useQuery({
    queryKey: [USERS_KEY, clinicId, "list", params],
    queryFn: () => listUsers(params, requireToken()),
    enabled: Boolean(clinicId),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateStaffUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaffUser(input, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive, requireToken()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}
