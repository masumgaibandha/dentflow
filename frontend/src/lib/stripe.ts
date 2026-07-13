import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

// Cached module-level promise so <Elements stripe={...}> always receives the
// same reference across renders, and loadStripe() (which fetches Stripe.js)
// only ever runs once per page load.
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
