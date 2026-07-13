"use client";

import { useEffect, useState } from "react";
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
      queryClient.removeQueries({
        queryKey: ["treatments", "admin"],
      });

      queryClient.removeQueries({
        queryKey: ["patients"],
      });

      queryClient.removeQueries({
        queryKey: ["dentists"],
      });

      queryClient.removeQueries({
        queryKey: ["appointments"],
      });

      queryClient.removeQueries({
        queryKey: ["invoices"],
      });

      queryClient.removeQueries({
        queryKey: ["dashboard"],
      });

      queryClient.removeQueries({
        queryKey: ["clinicSettings"],
      });

      queryClient.removeQueries({
        queryKey: ["clinicUsers"],
      });

      queryClient.removeQueries({
        queryKey: ["portal"],
      });

      setToken(data.token);

      queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, {
        user: data.user,
        clinic: data.clinic,
      });
    },
  });
}

export function useMe() {
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getToken()));
    setTokenChecked(true);
  }, []);

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => {
      const token = getToken();

      if (!token) {
        throw new Error("No token");
      }

      return fetchMe(token);
    },
    enabled: tokenChecked && hasToken,
    retry: false,
    staleTime: 60_000,
  });

  return {
    ...query,

    // Keep the initial server and browser render identical.
    isLoading: !tokenChecked || query.isLoading,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearToken();

    queryClient.removeQueries({
      queryKey: ["treatments", "admin"],
    });

    queryClient.removeQueries({
      queryKey: ["patients"],
    });

    queryClient.removeQueries({
      queryKey: ["dentists"],
    });

    queryClient.removeQueries({
      queryKey: ["appointments"],
    });

    queryClient.removeQueries({
      queryKey: ["invoices"],
    });

    queryClient.removeQueries({
      queryKey: ["dashboard"],
    });

    queryClient.removeQueries({
      queryKey: ["clinicSettings"],
    });

    queryClient.removeQueries({
      queryKey: ["clinicUsers"],
    });

    queryClient.removeQueries({
      queryKey: ["portal"],
    });

    queryClient.removeQueries({
      queryKey: ME_QUERY_KEY,
    });
  };
}
