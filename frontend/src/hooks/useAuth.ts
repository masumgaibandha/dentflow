"use client";

import { useSyncExternalStore } from "react";
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

      queryClient.removeQueries({
        queryKey: ["medical-records"],
      });

      setToken(data.token);

      queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, {
        user: data.user,
        clinic: data.clinic,
      });
    },
  });
}

// There's nothing to actually subscribe to here - localStorage's own token
// value only ever changes through setToken()/clearToken() in this same tab,
// never from underneath a mounted useMe() caller, so the subscribe callback
// is a no-op that never fires. useSyncExternalStore is used purely for its
// getSnapshot/getServerSnapshot split: `null` on the server (and on React's
// first client render, before it's safe to read localStorage) versus the
// real token-presence boolean once actually on the client - resolved by
// React itself, with no setState call anywhere. That's what keeps this out
// of the React Compiler's react-hooks/set-state-in-effect rule, which the
// equivalent useState+useEffect(() => setHasToken(...)) pattern used to hit.
function subscribeToToken() {
  return () => {};
}

function getTokenSnapshot(): boolean | null {
  return Boolean(getToken());
}

function getServerTokenSnapshot(): boolean | null {
  return null;
}

export function useMe() {
  const hasToken = useSyncExternalStore(subscribeToToken, getTokenSnapshot, getServerTokenSnapshot);
  const tokenChecked = hasToken !== null;

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => {
      const token = getToken();

      if (!token) {
        throw new Error("No token");
      }

      return fetchMe(token);
    },
    enabled: tokenChecked && Boolean(hasToken),
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
      queryKey: ["medical-records"],
    });

    queryClient.removeQueries({
      queryKey: ME_QUERY_KEY,
    });
  };
}
