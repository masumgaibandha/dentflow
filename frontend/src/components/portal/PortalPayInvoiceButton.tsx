"use client";

import { useState, type FormEvent } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCreatePortalPaymentIntent, useVerifyPortalPayment } from "@/hooks/usePortal";
import type { PortalInvoiceDetail } from "@/lib/api/portalApi";
import { getStripe } from "@/lib/stripe";

// Dedicated patient payment component - built from scratch, not a reuse of
// any admin invoice mutation component, and with no manual mark-paid/void/
// delete/refund/saved-card controls. clientSecret/paymentIntentId live only
// in this component's React state and are discarded the instant it unmounts
// (modal close, navigation away, logout, or switching accounts) - never
// written to localStorage/sessionStorage/cookies/the URL.

function PayForm({ invoiceId, onPaid }: { invoiceId: string; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const verifyPayment = useVerifyPortalPayment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed - please try again.");
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      setErrorMessage("Payment did not complete - please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      await verifyPayment.mutateAsync({ invoiceId, paymentIntentId: paymentIntent.id });
      onPaid();
    } catch {
      setErrorMessage("We couldn't confirm your payment - please contact your clinic.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

export function PortalPayInvoiceButton({ invoice }: { invoice: PortalInvoiceDetail }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const createPaymentIntent = useCreatePortalPaymentIntent();

  if (invoice.status !== "unpaid" || invoice.totalCents <= 0) {
    return null;
  }

  async function handleStart() {
    setClientSecret(null);
    const result = await createPaymentIntent.mutateAsync(invoice.id);
    setClientSecret(result.clientSecret);
  }

  if (clientSecret) {
    return (
      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="mb-3 text-sm font-medium">Pay online</p>
        <Elements stripe={getStripe()} options={{ clientSecret }}>
          <PayForm invoiceId={invoice.id} onPaid={() => setClientSecret(null)} />
        </Elements>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={createPaymentIntent.isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {createPaymentIntent.isPending ? "Preparing payment..." : "Pay online"}
      </button>
      {createPaymentIntent.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Something went wrong starting your payment. Please try again.
        </p>
      )}
    </div>
  );
}
