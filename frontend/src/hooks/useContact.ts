"use client";

import { useMutation } from "@tanstack/react-query";
import { sendContactMessage, type ContactMessageInput } from "@/lib/api/contactApi";

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (input: ContactMessageInput) => sendContactMessage(input),
  });
}
