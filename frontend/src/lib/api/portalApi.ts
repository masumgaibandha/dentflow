import { apiFetch } from "@/lib/api/client";

export interface PortalMe {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  clinic: { name: string };
  portalEmail: string;
}

export function getPortalMe(token: string): Promise<PortalMe> {
  return apiFetch<PortalMe>("/api/portal/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
