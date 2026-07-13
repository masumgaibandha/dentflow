import Stripe from "stripe";
import { ApiError } from "../utils/ApiError";
import { env } from "./env";

// Fixed test-mode currency for this milestone, matching the existing
// integer-cents (formatCents) convention used throughout the invoice model.
export const STRIPE_CURRENCY = "usd";

let cachedClient: Stripe | null = null;

// Lazily constructed and cached - never read at module load / app boot, so
// the rest of the app still starts without Stripe configured. Only routes
// that actually process a payment call this, and get a clear, safe error
// (no key value, no stack trace) if STRIPE_SECRET_KEY is missing.
export function getStripeClient(): Stripe {
  if (cachedClient) {
    return cachedClient;
  }

  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not configured");
    throw new ApiError(500, "Payment processing is not configured", "STRIPE_NOT_CONFIGURED");
  }
  if (!secretKey.startsWith("sk_test_")) {
    console.error("STRIPE_SECRET_KEY must be a Stripe test-mode secret key");
    throw new ApiError(500, "Payment processing is not configured", "STRIPE_NOT_CONFIGURED");
  }

  cachedClient = new Stripe(secretKey);
  return cachedClient;
}
