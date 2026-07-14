"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useSendContactMessage } from "@/hooks/useContact";
import { getErrorMessage } from "@/lib/errors";
import { contactFormSchema, type ContactFormValues } from "@/validators/contact";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendContactMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema) });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await sendMessage.mutateAsync(values);
        setSubmitted(true);
        reset();
        toast.success("Message sent - thanks for reaching out.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    () => {
      toast.error("Please fix the highlighted fields.");
    },
  );

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950">
        <p className="font-medium text-emerald-900 dark:text-emerald-200">Message sent</p>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
          Thanks for reaching out - we&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Name" error={errors.name?.message}>
        <input {...register("name")} className={inputClasses} autoComplete="name" />
      </FormField>
      <FormField label="Email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClasses} autoComplete="email" />
      </FormField>
      <FormField label="Subject" error={errors.subject?.message}>
        <input {...register("subject")} className={inputClasses} />
      </FormField>
      <FormField label="Message" error={errors.message?.message}>
        <textarea {...register("message")} rows={5} className={inputClasses} />
      </FormField>

      <button
        type="submit"
        disabled={sendMessage.isPending}
        className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700"
      >
        {sendMessage.isPending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
