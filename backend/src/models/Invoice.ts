import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export const INVOICE_STATUSES = ["unpaid", "paid", "void"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "mobile_banking"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface InvoiceLineItem {
  title: string;
  quantity: number;
  // All monetary fields are stored in the smallest currency unit (cents) as
  // integers throughout this model, specifically to avoid floating-point
  // rounding errors. unitPriceCents/lineTotalCents/subtotalCents/totalCents
  // are all integers; convert to/from major units only at API boundaries.
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface InvoicePayment {
  provider: "manual" | "stripe";
  method: PaymentMethod;
  paidAt: Date;
  reference?: string;
  // Only set when provider is "stripe" - the PaymentIntent id, a safe
  // reference (never the full Stripe response) for looking up the matching
  // PaymentTransaction document.
  stripePaymentIntentId?: string;
}

export interface InvoiceDocument extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  invoiceNumber: string;
  lineItems: InvoiceLineItem[];
  subtotalCents: number;
  totalCents: number;
  status: InvoiceStatus;
  payment?: InvoicePayment;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema<InvoiceLineItem>(
  {
    title: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
    lineTotalCents: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const paymentSchema = new Schema<InvoicePayment>(
  {
    provider: { type: String, enum: ["manual", "stripe"], required: true, default: "manual" },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    paidAt: { type: Date, required: true },
    reference: { type: String, trim: true },
    stripePaymentIntentId: { type: String, trim: true },
  },
  { _id: false },
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    invoiceNumber: { type: String, required: true },
    lineItems: {
      type: [lineItemSchema],
      required: true,
      validate: {
        validator: (items: InvoiceLineItem[]) => items.length > 0,
        message: "At least one line item is required",
      },
    },
    subtotalCents: { type: Number, required: true, min: 0 },
    totalCents: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: INVOICE_STATUSES,
      default: "unpaid",
      required: true,
      index: true,
    },
    payment: { type: paymentSchema },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

// Clinic-scoped invoice number uniqueness and display lookup.
invoiceSchema.index({ clinicId: 1, invoiceNumber: 1 }, { unique: true });
// List filtering/sorting.
invoiceSchema.index({ clinicId: 1, status: 1 });
invoiceSchema.index({ clinicId: 1, patientId: 1 });
invoiceSchema.index({ clinicId: 1, appointmentId: 1 });
invoiceSchema.index({ clinicId: 1, createdAt: 1 });

export const Invoice =
  (models.Invoice as Model<InvoiceDocument>) || model<InvoiceDocument>("Invoice", invoiceSchema);
