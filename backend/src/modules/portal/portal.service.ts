import { randomUUID } from "node:crypto";
import mongoose, { type FilterQuery } from "mongoose";
import { Appointment, type AppointmentDocument } from "../../models/Appointment";
import { Clinic } from "../../models/Clinic";
import { getStripeClient, STRIPE_CURRENCY } from "../../config/stripe";
import { Invoice, type InvoiceDocument } from "../../models/Invoice";
import { Patient } from "../../models/Patient";
import {
  PaymentTransaction,
  type PaymentTransactionStatus,
} from "../../models/PaymentTransaction";
import { User } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import type { ListPortalInvoicesQuery, PortalAppointmentsQuery } from "./portal.validation";

const DENTIST_POPULATE = { path: "dentistId", select: "name clinicId" };
const TREATMENT_POPULATE = { path: "treatmentId", select: "title clinicId" };

// clinicId and patientId here always come from the live, requireAuth-resolved
// User record (req.user) - never from a route/query param, and never trusted
// from the JWT payload directly. This endpoint takes no client-supplied ID at
// all, which is what makes it un-attackable by construction.
export async function getPortalMe(userId: string, clinicId: string, patientId: string) {
  const [patient, clinic, user] = await Promise.all([
    Patient.findById(patientId),
    Clinic.findById(clinicId),
    User.findById(userId),
  ]);

  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(500, "Linked patient record not found", "DATA_INTEGRITY_ERROR");
  }
  if (!clinic) {
    throw new ApiError(500, "Clinic record missing", "DATA_INTEGRITY_ERROR");
  }
  if (!user) {
    throw new ApiError(401, "User not found", "UNAUTHENTICATED");
  }

  return {
    id: patient._id.toString(),
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    clinic: { name: clinic.name },
    // The portal account's own login email (may differ from the patient's
    // clinical/contact email above) - shown so the patient knows what they
    // log in with.
    portalEmail: user.email,
  };
}

// Definitions (single source of truth for Portal 2):
//   upcoming: startTime >= now (server clock, the same absolute UTC instant
//             stored on the Appointment - no clinic-timezone adjustment).
//   past:     startTime < now.
// All statuses (scheduled, completed, cancelled) are included in both
// buckets and returned as-is - filtering by status is not offered here, the
// patient sees their full history/schedule with status displayed plainly.
function toPortalAppointmentDto(appointment: AppointmentDocument, clinicId: string) {
  const dentist = appointment.dentistId as unknown as
    | { name: string; clinicId: { toString(): string } }
    | undefined;
  const treatment = appointment.treatmentId as unknown as
    | { title: string; clinicId: { toString(): string } }
    | undefined;

  // Defense in depth: even if a corrupted reference ever pointed at another
  // clinic's Dentist/Treatment document, populate would still fetch it - this
  // check is what actually prevents that document's name from being exposed.
  const dentistName = dentist && dentist.clinicId.toString() === clinicId ? dentist.name : null;
  const treatmentTitle =
    treatment && treatment.clinicId.toString() === clinicId ? treatment.title : null;

  return {
    id: appointment._id.toString(),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    dentist: dentistName ? { name: dentistName } : null,
    treatment: treatmentTitle ? { title: treatmentTitle } : null,
  };
}

export async function getPortalAppointments(
  clinicId: string,
  patientId: string,
  query: PortalAppointmentsQuery,
) {
  const now = new Date();

  // Both clinicId and patientId come from the live, requireAuth-resolved
  // User record - this filter can never be widened by any query parameter.
  const filter: FilterQuery<AppointmentDocument> = {
    clinicId,
    patientId,
    startTime: query.when === "upcoming" ? { $gte: now } : { $lt: now },
  };

  const defaultSortOrder = query.when === "upcoming" ? "asc" : "desc";
  const direction: 1 | -1 = (query.sortOrder ?? defaultSortOrder) === "asc" ? 1 : -1;
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ startTime: direction })
      .skip(skip)
      .limit(query.limit)
      .populate(DENTIST_POPULATE)
      .populate(TREATMENT_POPULATE),
    Appointment.countDocuments(filter),
  ]);

  return {
    data: items.map((appointment) => toPortalAppointmentDto(appointment, clinicId)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

// Deliberately lean - no lineItems on the list view. Excludes notes,
// clinicId, patientId, appointmentId, invoiceSequence, payment.provider, and
// every other internal field, even though they exist on the Invoice model.
function toPortalInvoiceListDto(invoice: InvoiceDocument) {
  return {
    id: invoice._id.toString(),
    invoiceNumber: invoice.invoiceNumber,
    totalCents: invoice.totalCents,
    status: invoice.status,
    createdAt: invoice.createdAt,
    paidAt: invoice.payment?.paidAt ?? null,
  };
}

function toPortalInvoiceDetailDto(invoice: InvoiceDocument) {
  return {
    id: invoice._id.toString(),
    invoiceNumber: invoice.invoiceNumber,
    lineItems: invoice.lineItems.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents,
    })),
    subtotalCents: invoice.subtotalCents,
    totalCents: invoice.totalCents,
    status: invoice.status,
    payment: invoice.payment
      ? {
          method: invoice.payment.method,
          paidAt: invoice.payment.paidAt,
          reference: invoice.payment.reference,
        }
      : null,
    createdAt: invoice.createdAt,
  };
}

export async function listPortalInvoices(
  clinicId: string,
  patientId: string,
  query: ListPortalInvoicesQuery,
) {
  // clinicId and patientId come from the live req.user - the initial Mongo
  // filter, not a post-fetch check.
  const filter: FilterQuery<InvoiceDocument> = { clinicId, patientId };
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Invoice.countDocuments(filter),
  ]);

  return {
    data: items.map(toPortalInvoiceListDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getPortalInvoiceById(clinicId: string, patientId: string, invoiceId: string) {
  // A single ownership-scoped query - never findById-then-check. An invoice
  // belonging to another patient in the same clinic, or another clinic
  // entirely, simply never matches this filter and 404s either way.
  const invoice = await Invoice.findOne({ _id: invoiceId, clinicId, patientId });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }
  return toPortalInvoiceDetailDto(invoice);
}

function assertInvoicePayable(invoice: InvoiceDocument): void {
  if (invoice.status === "paid") {
    throw new ApiError(409, "Invoice is already paid", "INVOICE_ALREADY_PAID");
  }
  if (invoice.status === "void") {
    throw new ApiError(409, "Cannot pay a void invoice", "INVOICE_VOID");
  }
  if (invoice.totalCents <= 0) {
    throw new ApiError(400, "Invoice has no payable balance", "ZERO_VALUE_INVOICE");
  }
}

// PaymentIntent statuses that still represent an in-flight, reusable attempt
// (no payment method attached yet, or awaiting confirmation/3DS) - anything
// else (succeeded/processing/canceled) must not be silently reused.
const REUSABLE_STRIPE_STATUSES = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
]);

export async function createInvoicePaymentIntent(
  clinicId: string,
  patientId: string,
  invoiceId: string,
) {
  // Single ownership-scoped query - a mismatched clinic or patient 404s,
  // never a 403 that would confirm the invoice exists for someone else.
  const invoice = await Invoice.findOne({ _id: invoiceId, clinicId, patientId });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }
  assertInvoicePayable(invoice);

  const stripe = getStripeClient();

  const existing = await PaymentTransaction.findOne({
    invoiceId: invoice._id,
    clinicId,
    patientId,
    status: { $in: ["initiated", "processing"] },
  }).sort({ createdAt: -1 });

  if (existing) {
    let intent;
    try {
      intent = await stripe.paymentIntents.retrieve(existing.stripePaymentIntentId);
    } catch {
      intent = null;
    }
    if (intent && REUSABLE_STRIPE_STATUSES.has(intent.status) && intent.client_secret) {
      return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    }
  }

  // Server-generated, unique per attempt - passed to Stripe as the request
  // idempotency key so a network retry of this exact call cannot create a
  // second PaymentIntent, and stored (unique) on our own row as well.
  const idempotencyKey = `invoice_${invoice._id.toString()}_${randomUUID()}`;

  let intent;
  try {
    intent = await stripe.paymentIntents.create(
      {
        amount: invoice.totalCents,
        currency: STRIPE_CURRENCY,
        // Card only - this milestone is scoped to a single, simple test-mode
        // payment method, not buy-now-pay-later/wallet options.
        payment_method_types: ["card"],
        // Only non-sensitive identifiers - never treatment names, medical
        // info, notes, diagnosis, or appointment info.
        metadata: {
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          clinicId,
          patientId,
        },
      },
      { idempotencyKey },
    );
  } catch {
    throw new ApiError(502, "Unable to start payment - please try again", "STRIPE_ERROR");
  }

  if (!intent.client_secret) {
    throw new ApiError(502, "Unable to start payment - please try again", "STRIPE_ERROR");
  }

  await PaymentTransaction.create({
    clinicId,
    patientId,
    invoiceId: invoice._id,
    provider: "stripe",
    stripePaymentIntentId: intent.id,
    amountCents: invoice.totalCents,
    currency: STRIPE_CURRENCY,
    status: "initiated",
    idempotencyKey,
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
}

function mapStripeStatusToFailureState(
  status: string,
  hasLastPaymentError: boolean,
): PaymentTransactionStatus {
  if (status === "canceled") {
    return "cancelled";
  }
  if (hasLastPaymentError) {
    return "failed";
  }
  return "processing";
}

export async function verifyInvoicePayment(
  clinicId: string,
  patientId: string,
  invoiceId: string,
  paymentIntentId: string,
) {
  const invoice = await Invoice.findOne({ _id: invoiceId, clinicId, patientId });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }

  const transaction = await PaymentTransaction.findOne({
    invoiceId: invoice._id,
    clinicId,
    patientId,
    stripePaymentIntentId: paymentIntentId,
  });
  if (!transaction) {
    throw new ApiError(404, "Payment transaction not found", "NOT_FOUND");
  }

  // Idempotent short-circuit: a transaction that already succeeded means an
  // earlier call already verified and marked the invoice paid - calling this
  // endpoint again must not re-verify against Stripe or re-mutate anything.
  if (transaction.status === "succeeded") {
    return toPortalInvoiceDetailDto(invoice);
  }
  if (invoice.status === "paid") {
    return toPortalInvoiceDetailDto(invoice);
  }
  if (invoice.status === "void") {
    throw new ApiError(409, "Cannot pay a void invoice", "INVOICE_VOID");
  }

  const stripe = getStripeClient();
  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    throw new ApiError(502, "Unable to verify payment - please try again", "STRIPE_ERROR");
  }

  // Defense in depth: the query above already scopes the transaction lookup
  // by paymentIntentId, so this can only fail if Stripe itself returned a
  // different id, which should never happen.
  if (intent.id !== paymentIntentId) {
    throw new ApiError(400, "Payment verification failed", "PAYMENT_MISMATCH");
  }

  if (intent.status !== "succeeded") {
    transaction.status = mapStripeStatusToFailureState(
      intent.status,
      Boolean(intent.last_payment_error),
    );
    transaction.failureCode = intent.last_payment_error?.code;
    transaction.failureMessage = intent.last_payment_error?.message;
    await transaction.save();
    throw new ApiError(400, "Payment has not completed successfully", "PAYMENT_NOT_SUCCEEDED");
  }

  if (intent.amount_received !== invoice.totalCents) {
    throw new ApiError(400, "Payment amount does not match the invoice total", "AMOUNT_MISMATCH");
  }
  if (intent.currency !== STRIPE_CURRENCY) {
    throw new ApiError(400, "Payment currency does not match", "CURRENCY_MISMATCH");
  }
  if (
    intent.metadata.invoiceId !== invoice._id.toString() ||
    intent.metadata.clinicId !== clinicId ||
    intent.metadata.patientId !== patientId
  ) {
    throw new ApiError(400, "Payment metadata does not match", "METADATA_MISMATCH");
  }

  // All Stripe calls (and their retries above) happen before this point, so
  // the DB transaction below stays as short as possible. Only the final
  // Invoice+PaymentTransaction write pair is transactional: both commit
  // together, or neither does, so a crash or write conflict between the two
  // saves can never leave one marked succeeded/paid without the other.
  const paidAt = new Date();
  const session = await mongoose.startSession();
  try {
    let result: ReturnType<typeof toPortalInvoiceDetailDto> | undefined;

    await session.withTransaction(async () => {
      // Re-read both documents inside the transaction - a concurrent
      // verify-payment call (duplicate request, two tabs, a retry) may have
      // already finalized this exact invoice/transaction between the reads
      // above and this point, so the state re-checked here is authoritative.
      const freshInvoice = await Invoice.findOne(
        { _id: invoice._id, clinicId, patientId },
        null,
        { session },
      );
      if (!freshInvoice) {
        throw new ApiError(404, "Invoice not found", "NOT_FOUND");
      }

      const freshTransaction = await PaymentTransaction.findOne(
        { _id: transaction._id },
        null,
        { session },
      );
      if (!freshTransaction) {
        throw new ApiError(404, "Payment transaction not found", "NOT_FOUND");
      }

      // Idempotent: a concurrent request already finalized this payment -
      // return the already-committed state instead of re-mutating anything.
      if (freshTransaction.status === "succeeded" || freshInvoice.status === "paid") {
        result = toPortalInvoiceDetailDto(freshInvoice);
        return;
      }
      if (freshInvoice.status === "void") {
        throw new ApiError(409, "Cannot pay a void invoice", "INVOICE_VOID");
      }

      freshInvoice.status = "paid";
      freshInvoice.payment = {
        provider: "stripe",
        method: "card",
        paidAt,
        reference: intent.id,
        stripePaymentIntentId: intent.id,
      };
      await freshInvoice.save({ session });

      freshTransaction.status = "succeeded";
      freshTransaction.paidAt = paidAt;
      await freshTransaction.save({ session });

      result = toPortalInvoiceDetailDto(freshInvoice);
    });

    return result as ReturnType<typeof toPortalInvoiceDetailDto>;
  } finally {
    await session.endSession();
  }
}
