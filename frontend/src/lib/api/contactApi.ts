import { apiFetch } from "@/lib/api/client";

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  createdAt: string;
}

// Deliberately no auth header - this is a public, unauthenticated endpoint.
export function sendContactMessage(input: ContactMessageInput): Promise<ContactMessageResponse> {
  return apiFetch<ContactMessageResponse>("/api/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
