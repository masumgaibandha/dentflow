"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMe,
  login,
  registerClinic,
  type LoginPayload,
  type MeResponse,
  type RegisterPayload,
} from "@/lib/auth/authApi";
import { clearToken, getToken, setToken } from "@/lib/auth/token";

const ME_QUERY_KEY = ["me"] as const;

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerClinic(payload),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, {
        user: data.user,
        clinic: data.clinic,
      });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => {
      const token = getToken();
      if (!token) {
        throw new Error("No token");
      }
      return fetchMe(token);
    },
    enabled: getToken() !== null,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
  };
}
