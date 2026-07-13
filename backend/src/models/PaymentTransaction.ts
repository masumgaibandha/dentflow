import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export const PAYMENT_TRANSACTION_STATUSES = [
  "initiated",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type PaymentTransactionStatus = (typeof PAYMENT_TRANSACTION_STATUSES)[number];

export interface PaymentTransactionDocument extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  invoiceId: Types.ObjectId;
  provider: "stripe";
  stripePaymentIntentId: string;
  amountCents: number;
  currency: string;
  status: PaymentTransactionStatus;
  idempotencyKey: string;
  failureCode?: string;
  failureMessage?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Deliberately narrow: no card numbers, CVC, OTP, or full Stripe response
// objects are ever stored here - only the safe, minimal fields needed to
// track a PaymentIntent's lifecycle against an invoice.
const paymentTransactionSchema = new Schema<PaymentTransactionDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    provider: { type: String, enum: ["stripe"], required: true, default: "stripe" },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    amountCents: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: PAYMENT_TRANSACTION_STATUSES,
      default: "initiated",
      required: true,
    },
    idempotencyKey: { type: String, required: true, unique: true },
    failureCode: { type: String, trim: true },
    failureMessage: { type: String, trim: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

// Clinic-scoped lookups (list a patient's transactions, admin reporting later).
paymentTransactionSchema.index({ clinicId: 1, invoiceId: 1 });
paymentTransactionSchema.index({ clinicId: 1, patientId: 1 });

// Belt-and-suspenders at the DB layer: only one *succeeded* transaction may
// ever exist for a given invoice, even under concurrent verify-payment calls.
// Multiple failed/cancelled attempts for the same invoice remain unrestricted.
paymentTransactionSchema.index(
  { invoiceId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "succeeded" } },
);

export const PaymentTransaction =
  (models.PaymentTransaction as Model<PaymentTransactionDocument>) ||
  model<PaymentTransactionDocument>("PaymentTransaction", paymentTransactionSchema);
