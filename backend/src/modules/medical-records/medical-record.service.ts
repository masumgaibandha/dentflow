import type { FilterQuery, Model, Types } from "mongoose";
import { Appointment, type AppointmentDocument } from "../../models/Appointment";
import { Dentist } from "../../models/Dentist";
import { MedicalRecord, type MedicalRecordDocument } from "../../models/MedicalRecord";
import { Patient } from "../../models/Patient";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateAmendmentInput,
  CreateMedicalRecordInput,
  ListMedicalRecordsQuery,
  UpdateMedicalRecordInput,
  UpdateMedicalRecordVisibilityInput,
} from "./medical-record.validation";

const PATIENT_POPULATE = { path: "patientId", select: "name clinicId" };
const APPOINTMENT_POPULATE = { path: "appointmentId", select: "startTime clinicId" };
const DENTIST_POPULATE = { path: "attendingDentistId", select: "name clinicId" };
const AUTHOR_POPULATE = { path: "authorUserId", select: "name clinicId" };
const RECORD_POPULATE = [PATIENT_POPULATE, APPOINTMENT_POPULATE, DENTIST_POPULATE, AUTHOR_POPULATE];

type PopulatedRef = { _id: unknown; clinicId: { toString(): string } } | undefined;

// Defense in depth: even if a corrupted/legacy reference ever pointed at
// another clinic's document, populate would still fetch it - this is what
// actually prevents that document's data from being exposed in the response
// (mirrors the same pattern already used in portal.service.ts).
function sameClinic(ref: PopulatedRef, clinicId: string): boolean {
  return Boolean(ref && ref.clinicId && ref.clinicId.toString() === clinicId);
}

async function assertBelongsToClinic<T extends { clinicId: Types.ObjectId }>(
  RefModel: Model<T>,
  id: string,
  clinicId: string,
  label: string,
): Promise<InstanceType<Model<T>>> {
  const doc = await RefModel.findById(id);
  if (!doc || doc.clinicId.toString() !== clinicId) {
    throw new ApiError(404, `${label} not found`, "NOT_FOUND");
  }
  return doc as InstanceType<Model<T>>;
}

// If both an appointment and an attending dentist are supplied, they must
// describe the same visit - a record claiming a dentist who wasn't the one
// on the linked appointment would be clinically misleading. There is no
// "override" path in this milestone: mismatches are rejected outright rather
// than silently accepted, which is the safer default for a clinical record.
function assertDentistConsistentWithAppointment(
  appointment: AppointmentDocument | null,
  attendingDentistId: string | undefined,
): void {
  if (!appointment || !attendingDentistId) return;
  if (appointment.dentistId.toString() !== attendingDentistId) {
    throw new ApiError(
      400,
      "The attending dentist does not match the linked appointment's dentist",
      "DENTIST_APPOINTMENT_MISMATCH",
    );
  }
}

async function validateRelatedEntities(
  clinicId: string,
  patientId: string,
  appointmentId: string | undefined,
  attendingDentistId: string | undefined,
): Promise<void> {
  if (attendingDentistId) {
    await assertBelongsToClinic(Dentist, attendingDentistId, clinicId, "Dentist");
  }

  if (appointmentId) {
    const appointment = await assertBelongsToClinic(Appointment, appointmentId, clinicId, "Appointment");
    if (appointment.patientId.toString() !== patientId) {
      throw new ApiError(
        400,
        "The selected appointment does not belong to the selected patient",
        "PATIENT_APPOINTMENT_MISMATCH",
      );
    }
    assertDentistConsistentWithAppointment(appointment, attendingDentistId);
  }
}

function toPatientRef(record: MedicalRecordDocument, clinicId: string) {
  const patient = record.patientId as unknown as PopulatedRef & { name?: string };
  if (!sameClinic(patient, clinicId)) {
    return { id: record.patientId.toString(), name: null };
  }
  return { id: String(patient!._id), name: patient!.name ?? null };
}

function toAppointmentRef(record: MedicalRecordDocument, clinicId: string) {
  if (!record.appointmentId) return null;
  const appointment = record.appointmentId as unknown as PopulatedRef & { startTime?: Date };
  if (!sameClinic(appointment, clinicId)) {
    return { id: record.appointmentId.toString(), startTime: null };
  }
  return { id: String(appointment!._id), startTime: appointment!.startTime ?? null };
}

function toDentistRef(record: MedicalRecordDocument, clinicId: string) {
  if (!record.attendingDentistId) return null;
  const dentist = record.attendingDentistId as unknown as PopulatedRef & { name?: string };
  if (!sameClinic(dentist, clinicId)) {
    return { id: record.attendingDentistId.toString(), name: null };
  }
  return { id: String(dentist!._id), name: dentist!.name ?? null };
}

function toAuthorRef(record: MedicalRecordDocument, clinicId: string) {
  const author = record.authorUserId as unknown as PopulatedRef & { name?: string };
  if (!sameClinic(author, clinicId)) {
    return { name: null };
  }
  return { name: author!.name ?? null };
}

// Never includes the full clinical description - list views must not expose
// the detailed clinical text (see medical-record.controller.ts / point 11 of
// the milestone spec).
function toListItemDto(record: MedicalRecordDocument, clinicId: string) {
  return {
    id: record._id.toString(),
    patient: toPatientRef(record, clinicId),
    appointment: toAppointmentRef(record, clinicId),
    attendingDentist: toDentistRef(record, clinicId),
    author: toAuthorRef(record, clinicId),
    recordType: record.recordType,
    title: record.title,
    recordDate: record.recordDate,
    status: record.status,
    finalizedAt: record.finalizedAt ?? null,
    isAmendment: Boolean(record.amendedRecordId),
    // Staff-only visibility state - never present on the patient-facing
    // portal DTOs (see portal.service.ts), which have no reason to know
    // their own publication metadata.
    patientVisible: record.patientVisible,
    createdAt: record.createdAt,
  };
}

interface AmendmentSummary {
  id: string;
  title: string;
  recordDate: Date;
  amendmentReason: string | null;
  author: { name: string | null };
  patientVisible: boolean;
  createdAt: Date;
}

async function toDetailDto(record: MedicalRecordDocument, clinicId: string) {
  let amendedRecord: { id: string; title: string; recordDate: Date } | null = null;
  let amendments: AmendmentSummary[] = [];

  if (record.amendedRecordId) {
    // Clinic-scoped lookup even though this record's own clinicId already
    // guarantees the original is in the same clinic (amendments are only
    // ever created against a same-clinic original) - defense in depth, never
    // trust a stored reference without re-checking it.
    const original = await MedicalRecord.findOne({ _id: record.amendedRecordId, clinicId }).select(
      "title recordDate",
    );
    amendedRecord = original
      ? { id: original._id.toString(), title: original.title, recordDate: original.recordDate }
      : null;
  } else {
    const relatedAmendments = await MedicalRecord.find({
      clinicId,
      amendedRecordId: record._id,
    })
      .sort({ createdAt: 1 })
      .populate(AUTHOR_POPULATE);

    amendments = relatedAmendments.map((amendment) => ({
      id: amendment._id.toString(),
      title: amendment.title,
      recordDate: amendment.recordDate,
      amendmentReason: amendment.amendmentReason ?? null,
      author: toAuthorRef(amendment, clinicId),
      patientVisible: amendment.patientVisible,
      createdAt: amendment.createdAt,
    }));
  }

  return {
    ...toListItemDto(record, clinicId),
    description: record.description,
    amendmentReason: record.amendmentReason ?? null,
    amendedRecord,
    amendments,
  };
}

function buildFilter(clinicId: string, query: ListMedicalRecordsQuery): FilterQuery<MedicalRecordDocument> {
  const filter: FilterQuery<MedicalRecordDocument> = { clinicId, patientId: query.patientId };

  if (query.appointmentId) filter.appointmentId = query.appointmentId;
  if (query.attendingDentistId) filter.attendingDentistId = query.attendingDentistId;
  if (query.status) filter.status = query.status;
  if (query.recordType) filter.recordType = query.recordType;

  return filter;
}

export async function listMedicalRecords(clinicId: string, query: ListMedicalRecordsQuery) {
  const filter = buildFilter(clinicId, query);
  const direction: 1 | -1 = query.sortOrder === "asc" ? 1 : -1;
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    MedicalRecord.find(filter)
      // Excludes the clinical description at the query level, not just in
      // the DTO - the list view never even fetches the full text.
      .select("-description")
      .sort({ recordDate: direction })
      .skip(skip)
      .limit(query.limit)
      .populate(RECORD_POPULATE),
    MedicalRecord.countDocuments(filter),
  ]);

  return {
    data: items.map((item) => toListItemDto(item, clinicId)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

async function findByIdScoped(id: string, clinicId: string): Promise<MedicalRecordDocument> {
  // Single clinic-scoped query - never findById-then-check. A record
  // belonging to another clinic simply never matches this filter, so a
  // guessed cross-clinic id 404s without ever confirming the record exists.
  const record = await MedicalRecord.findOne({ _id: id, clinicId }).populate(RECORD_POPULATE);
  if (!record) {
    throw new ApiError(404, "Medical record not found", "NOT_FOUND");
  }
  return record;
}

export async function getMedicalRecordById(id: string, clinicId: string) {
  const record = await findByIdScoped(id, clinicId);
  return toDetailDto(record, clinicId);
}

export async function createMedicalRecord(
  clinicId: string,
  authorUserId: string,
  input: CreateMedicalRecordInput,
) {
  await assertBelongsToClinic(Patient, input.patientId, clinicId, "Patient");
  await validateRelatedEntities(clinicId, input.patientId, input.appointmentId, input.attendingDentistId);

  const record = await MedicalRecord.create({
    clinicId,
    patientId: input.patientId,
    appointmentId: input.appointmentId,
    attendingDentistId: input.attendingDentistId,
    authorUserId,
    recordType: input.recordType,
    title: input.title,
    description: input.description,
    recordDate: input.recordDate ?? new Date(),
    status: "draft",
  });

  return getMedicalRecordById(record._id.toString(), clinicId);
}

export async function updateMedicalRecord(
  id: string,
  clinicId: string,
  input: UpdateMedicalRecordInput,
) {
  // Read-only peek to resolve patientId (immutable, never accepted from the
  // request) and to validate references against it. The actual
  // draft-vs-finalized safety guarantee comes from the atomic conditional
  // update below, not from this read - a concurrent finalize between this
  // read and that write is exactly the race the atomic filter closes.
  const current = await findByIdScoped(id, clinicId);

  const nextAppointmentId =
    input.appointmentId !== undefined ? input.appointmentId : current.appointmentId?.toString();
  const nextAttendingDentistId =
    input.attendingDentistId !== undefined
      ? input.attendingDentistId
      : current.attendingDentistId?.toString();

  await validateRelatedEntities(
    clinicId,
    current.patientId.toString(),
    nextAppointmentId,
    nextAttendingDentistId,
  );

  const updates: Record<string, unknown> = {};
  if (input.appointmentId !== undefined) updates.appointmentId = input.appointmentId;
  if (input.attendingDentistId !== undefined) updates.attendingDentistId = input.attendingDentistId;
  if (input.recordType !== undefined) updates.recordType = input.recordType;
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.recordDate !== undefined) updates.recordDate = input.recordDate;

  // Single atomic conditional update - status:"draft" is part of the same
  // filter as the id/clinic scope, so a concurrent finalize that wins the
  // race makes this update simply match nothing rather than clobbering a
  // just-finalized record.
  const updated = await MedicalRecord.findOneAndUpdate(
    { _id: id, clinicId, status: "draft" },
    { $set: updates },
    { new: true },
  );

  if (!updated) {
    // Distinguish "already finalized" (409) from "gone/wrong clinic" (404)
    // purely for a clearer error message - this secondary read never causes
    // a mutation and is itself clinic-scoped, so it cannot leak cross-clinic
    // existence either.
    const stillExists = await MedicalRecord.exists({ _id: id, clinicId });
    if (stillExists) {
      throw new ApiError(409, "Cannot edit a finalized medical record", "MEDICAL_RECORD_FINALIZED");
    }
    throw new ApiError(404, "Medical record not found", "NOT_FOUND");
  }

  return getMedicalRecordById(id, clinicId);
}

export async function deleteDraftMedicalRecord(id: string, clinicId: string): Promise<void> {
  // Tenant-scoped atomic conditional delete - draft status is part of the
  // same filter as the delete itself, never a separate fetch-then-delete.
  const deleted = await MedicalRecord.findOneAndDelete({ _id: id, clinicId, status: "draft" });

  if (!deleted) {
    const stillExists = await MedicalRecord.exists({ _id: id, clinicId });
    if (stillExists) {
      throw new ApiError(
        409,
        "Only draft medical records can be discarded - finalized records cannot be deleted",
        "MEDICAL_RECORD_FINALIZED",
      );
    }
    throw new ApiError(404, "Medical record not found", "NOT_FOUND");
  }
}

export async function finalizeMedicalRecord(id: string, clinicId: string) {
  const finalizedAt = new Date();

  // Single atomic conditional update: at most one concurrent finalize
  // request can ever match status:"draft" and win. A finalized record can
  // never transition back to draft - there is no code path that sets status
  // to "draft" once it is "finalized".
  const updated = await MedicalRecord.findOneAndUpdate(
    { _id: id, clinicId, status: "draft" },
    { $set: { status: "finalized", finalizedAt } },
    { new: true },
  );

  if (updated) {
    return getMedicalRecordById(id, clinicId);
  }

  const existing = await MedicalRecord.findOne({ _id: id, clinicId });
  if (!existing) {
    throw new ApiError(404, "Medical record not found", "NOT_FOUND");
  }
  // Controlled conflict response for a repeat finalize call - mirrors the
  // project's established pattern for a repeat state-changing action (see
  // markInvoicePaid's INVOICE_ALREADY_PAID in invoice.service.ts) rather than
  // silently re-succeeding.
  throw new ApiError(409, "Medical record is already finalized", "MEDICAL_RECORD_ALREADY_FINALIZED");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

// Toggles patient-portal publication. Works identically for original records
// and amendments - both are plain MedicalRecord documents, and this
// deliberately does not special-case either (see the milestone's "originals
// and amendments may have visibility controlled separately" requirement).
// A single endpoint handles both publish and unpublish (the request body
// simply carries the desired boolean) rather than two separate routes.
export async function updateMedicalRecordVisibility(
  id: string,
  clinicId: string,
  userId: string,
  input: UpdateMedicalRecordVisibilityInput,
) {
  // Tenant-scoped atomic conditional update - status:"finalized" is part of
  // the same filter as the id/clinic scope, so a draft can never match this
  // update (a draft can never be patient-visible). Naturally idempotent:
  // calling this repeatedly with the same value just re-applies the same
  // $set and re-succeeds, no special-case needed. This single $set only ever
  // touches patientVisible + its own audit fields, so clinical content,
  // amendment relationships, and finalized state can never be affected by a
  // visibility change.
  const updated = await MedicalRecord.findOneAndUpdate(
    { _id: id, clinicId, status: "finalized" },
    {
      $set: {
        patientVisible: input.patientVisible,
        patientVisibilityUpdatedAt: new Date(),
        patientVisibilityUpdatedByUserId: userId,
      },
    },
    { new: true },
  );

  if (!updated) {
    const stillExists = await MedicalRecord.exists({ _id: id, clinicId });
    if (stillExists) {
      throw new ApiError(
        409,
        "Only a finalized medical record can have its patient visibility changed",
        "MEDICAL_RECORD_NOT_FINALIZED",
      );
    }
    throw new ApiError(404, "Medical record not found", "NOT_FOUND");
  }

  return getMedicalRecordById(id, clinicId);
}

export async function createAmendment(
  originalId: string,
  clinicId: string,
  authorUserId: string,
  input: CreateAmendmentInput,
  idempotencyKey: string,
) {
  // Idempotent replay: an earlier identical submission (double-click, a
  // retried request) already created this amendment - return it as-is
  // instead of re-validating or creating a second one.
  const existing = await MedicalRecord.findOne({ clinicId, amendedRecordId: originalId, idempotencyKey });
  if (existing) {
    return getMedicalRecordById(existing._id.toString(), clinicId);
  }

  // Clinic-scoped, must be finalized, and must itself be an original record
  // (not already an amendment) - amendments always chain back to a single
  // authoritative original, never to another amendment, so the correction
  // history stays a flat, easy-to-audit list rather than an arbitrary chain.
  const original = await MedicalRecord.findOne({ _id: originalId, clinicId });
  if (!original) {
    throw new ApiError(404, "Medical record not found", "NOT_FOUND");
  }
  if (original.status !== "finalized") {
    throw new ApiError(
      409,
      "Only a finalized medical record can be amended",
      "MEDICAL_RECORD_NOT_FINALIZED",
    );
  }
  if (original.amendedRecordId) {
    throw new ApiError(
      400,
      "Cannot amend an amendment - amendments must reference the original record",
      "CANNOT_AMEND_AMENDMENT",
    );
  }

  let amendment;
  try {
    amendment = await MedicalRecord.create({
      clinicId,
      patientId: original.patientId,
      appointmentId: original.appointmentId,
      attendingDentistId: original.attendingDentistId,
      authorUserId,
      recordType: original.recordType,
      title: input.title,
      description: input.description,
      recordDate: input.recordDate ?? new Date(),
      // An amendment is created directly as an immutable, authored
      // correction - there is no draft phase for amendments in this
      // milestone (unlike the original creation flow), since a
      // half-finished/discardable "amendment draft" has no clear clinical
      // meaning of its own.
      status: "finalized",
      finalizedAt: new Date(),
      amendedRecordId: original._id,
      amendmentReason: input.amendmentReason,
      idempotencyKey,
    });
  } catch (error) {
    // A concurrent duplicate submission with the same idempotency key lost
    // the create race and was caught by the unique index instead - treat it
    // exactly like the idempotent-replay path above.
    if (isDuplicateKeyError(error)) {
      const winner = await MedicalRecord.findOne({ clinicId, amendedRecordId: originalId, idempotencyKey });
      if (winner) {
        return getMedicalRecordById(winner._id.toString(), clinicId);
      }
    }
    throw error;
  }

  return getMedicalRecordById(amendment._id.toString(), clinicId);
}
