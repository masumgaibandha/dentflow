import type { FilterQuery } from "mongoose";
import { Appointment } from "../../models/Appointment";
import { Clinic } from "../../models/Clinic";
import { Invoice, type InvoiceDocument, type InvoiceLineItem } from "../../models/Invoice";
import { Patient } from "../../models/Patient";
import { ApiError } from "../../utils/ApiError";
import type {
  InvoiceInput,
  LineItemInput,
  ListInvoicesQuery,
  MarkPaidInput,
  UpdateInvoiceInput,
} from "./invoice.validation";

const PATIENT_POPULATE = { path: "patientId", select: "name email phone" };
const APPOINTMENT_POPULATE = { path: "appointmentId", select: "startTime endTime status" };

function toInvoiceDto(invoice: InvoiceDocument) {
  const patient = invoice.patientId as unknown as
    | { _id: unknown; name: string; email?: string; phone?: string }
    | undefined;
  const appointment = invoice.appointmentId as unknown as
    | { _id: unknown; startTime: Date; endTime: Date; status: string }
    | undefined;

  return {
    id: invoice._id.toString(),
    clinicId: invoice.clinicId.toString(),
    invoiceNumber: invoice.invoiceNumber,
    patient: patient
      ? { id: String(patient._id), name: patient.name, email: patient.email, phone: patient.phone }
      : { id: invoice.patientId.toString() },
    appointment:
      appointment && appointment._id
        ? {
            id: String(appointment._id),
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
          }
        : invoice.appointmentId
          ? { id: invoice.appointmentId.toString() }
          : null,
    lineItems: invoice.lineItems,
    subtotalCents: invoice.subtotalCents,
    totalCents: invoice.totalCents,
    status: invoice.status,
    payment: invoice.payment ?? null,
    notes: invoice.notes,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

async function assertPatientBelongsToClinic(patientId: string, clinicId: string): Promise<void> {
  const patient = await Patient.findById(patientId);
  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Patient not found", "NOT_FOUND");
  }
}

async function assertAppointmentMatchesPatient(
  appointmentId: string,
  clinicId: string,
  patientId: string,
): Promise<void> {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Appointment not found", "NOT_FOUND");
  }
  if (appointment.patientId.toString() !== patientId) {
    throw new ApiError(
      400,
      "The selected appointment does not belong to the selected patient",
      "PATIENT_APPOINTMENT_MISMATCH",
    );
  }
}

function computeLineItems(input: LineItemInput[]): {
  lineItems: InvoiceLineItem[];
  subtotalCents: number;
} {
  const lineItems = input.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: item.quantity * item.unitPriceCents,
  }));

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

  return { lineItems, subtotalCents };
}

async function generateInvoiceNumber(clinicId: string): Promise<string> {
  const clinic = await Clinic.findByIdAndUpdate(
    clinicId,
    { $inc: { invoiceSequence: 1 } },
    { new: true },
  );
  if (!clinic) {
    throw new ApiError(500, "Clinic record missing", "DATA_INTEGRITY_ERROR");
  }
  return `INV-${String(clinic.invoiceSequence).padStart(6, "0")}`;
}

function buildFilter(clinicId: string, query: ListInvoicesQuery): FilterQuery<InvoiceDocument> {
  const filter: FilterQuery<InvoiceDocument> = { clinicId };

  if (query.status) filter.status = query.status;
  if (query.patientId) filter.patientId = query.patientId;
  if (query.appointmentId) filter.appointmentId = query.appointmentId;

  if (query.dateFrom || query.dateTo) {
    filter[query.dateField] = {
      ...(query.dateFrom ? { $gte: query.dateFrom } : {}),
      ...(query.dateTo ? { $lte: query.dateTo } : {}),
    };
  }

  return filter;
}

function buildSort(query: ListInvoicesQuery): Record<string, 1 | -1> {
  const direction = query.sortOrder === "asc" ? 1 : -1;
  return { [query.sortBy]: direction };
}

export async function listInvoices(clinicId: string, query: ListInvoicesQuery) {
  const filter = buildFilter(clinicId, query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate(PATIENT_POPULATE)
      .populate(APPOINTMENT_POPULATE),
    Invoice.countDocuments(filter),
  ]);

  return {
    data: items.map(toInvoiceDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getInvoiceById(id: string, clinicId: string) {
  const invoice = await Invoice.findById(id)
    .populate(PATIENT_POPULATE)
    .populate(APPOINTMENT_POPULATE);
  if (!invoice || invoice.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }
  return toInvoiceDto(invoice);
}

export async function createInvoice(clinicId: string, input: InvoiceInput) {
  await assertPatientBelongsToClinic(input.patientId, clinicId);
  if (input.appointmentId) {
    await assertAppointmentMatchesPatient(input.appointmentId, clinicId, input.patientId);
  }

  const { lineItems, subtotalCents } = computeLineItems(input.lineItems);
  const invoiceNumber = await generateInvoiceNumber(clinicId);

  const invoice = await Invoice.create({
    clinicId,
    patientId: input.patientId,
    appointmentId: input.appointmentId,
    invoiceNumber,
    lineItems,
    subtotalCents,
    totalCents: subtotalCents,
    notes: input.notes,
  });

  return getInvoiceById(invoice._id.toString(), clinicId);
}

export async function updateInvoice(id: string, clinicId: string, input: UpdateInvoiceInput) {
  const invoice = await Invoice.findById(id);
  if (!invoice || invoice.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }
  if (invoice.status !== "unpaid") {
    throw new ApiError(
      409,
      `Cannot edit an invoice that is already ${invoice.status}`,
      "INVOICE_LOCKED",
    );
  }

  const nextPatientId = input.patientId ?? invoice.patientId.toString();
  if (input.patientId) {
    await assertPatientBelongsToClinic(input.patientId, clinicId);
  }

  const nextAppointmentId =
    input.appointmentId !== undefined ? input.appointmentId : invoice.appointmentId?.toString();
  if (nextAppointmentId) {
    await assertAppointmentMatchesPatient(nextAppointmentId, clinicId, nextPatientId);
  }

  const { lineItems: lineItemsInput, ...rest } = input;
  Object.assign(invoice, rest);

  if (lineItemsInput) {
    const { lineItems, subtotalCents } = computeLineItems(lineItemsInput);
    Object.assign(invoice, { lineItems, subtotalCents, totalCents: subtotalCents });
  }

  await invoice.save();
  return getInvoiceById(id, clinicId);
}

export async function markInvoicePaid(id: string, clinicId: string, input: MarkPaidInput) {
  const invoice = await Invoice.findById(id);
  if (!invoice || invoice.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }

  if (invoice.status === "void") {
    throw new ApiError(409, "Cannot mark a void invoice as paid", "INVOICE_VOID");
  }
  if (invoice.status === "paid") {
    throw new ApiError(409, "Invoice is already paid", "INVOICE_ALREADY_PAID");
  }

  invoice.status = "paid";
  invoice.payment = {
    provider: "manual",
    method: input.method,
    paidAt: new Date(),
    reference: input.reference || undefined,
  };
  await invoice.save();
  return getInvoiceById(id, clinicId);
}

export async function voidInvoice(id: string, clinicId: string) {
  const invoice = await Invoice.findById(id);
  if (!invoice || invoice.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }

  if (invoice.status === "void") {
    throw new ApiError(409, "Invoice is already void", "INVOICE_ALREADY_VOID");
  }

  invoice.status = "void";
  await invoice.save();
  return getInvoiceById(id, clinicId);
}

export async function deleteInvoice(id: string, clinicId: string): Promise<void> {
  const invoice = await Invoice.findById(id);
  if (!invoice || invoice.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Invoice not found", "NOT_FOUND");
  }

  if (invoice.status !== "unpaid") {
    throw new ApiError(
      409,
      "Only unpaid invoices can be deleted - void a paid invoice instead to preserve billing history",
      "INVOICE_LOCKED",
    );
  }

  await invoice.deleteOne();
}
