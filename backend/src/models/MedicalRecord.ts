import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export const MEDICAL_RECORD_TYPES = [
  "consultation",
  "diagnosis",
  "procedure_note",
  "follow_up",
  "other",
] as const;

export type MedicalRecordType = (typeof MEDICAL_RECORD_TYPES)[number];

export const MEDICAL_RECORD_STATUSES = ["draft", "finalized"] as const;

export type MedicalRecordStatus = (typeof MEDICAL_RECORD_STATUSES)[number];

export const MEDICAL_RECORD_TITLE_MAX_LENGTH = 200;
export const MEDICAL_RECORD_DESCRIPTION_MAX_LENGTH = 10_000;
export const MEDICAL_RECORD_AMENDMENT_REASON_MAX_LENGTH = 500;

export interface MedicalRecordDocument extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  attendingDentistId?: Types.ObjectId;
  // The authenticated admin/staff User who authored this record - always
  // server-derived from req.user, never client-supplied (see medical-record
  // validation/service - the create schema rejects this field outright).
  authorUserId: Types.ObjectId;
  recordType: MedicalRecordType;
  title: string;
  description: string;
  recordDate: Date;
  status: MedicalRecordStatus;
  finalizedAt?: Date;
  // Only set on an amendment record - points at the original, still-finalized
  // record it corrects/adds to. The original is never mutated or replaced;
  // amendments are separate documents (see medical-record.service.ts).
  amendedRecordId?: Types.ObjectId;
  amendmentReason?: string;
  // Only set on amendment records, from the client-supplied Idempotency-Key
  // header - dedupes a double-click/retried amendment submission. Never set
  // on a plain create/update.
  idempotencyKey?: string;
  // Clinic-controlled publication to the owning patient's portal. Defaults
  // false, and a document where the field was never written (legacy record)
  // must also read as not-visible - achieved for free by querying
  // `patientVisible: true` directly rather than any $or-with-$exists
  // fallback, since Mongo's query engine never treats a missing field as
  // matching an exact `true` filter. Finalization does NOT set this - a
  // newly finalized record stays hidden until a staff/admin explicitly
  // publishes it (see medical-record.service.ts's updateMedicalRecordVisibility).
  patientVisible: boolean;
  patientVisibilityUpdatedAt?: Date;
  // The authenticated admin/staff User who last changed patientVisible -
  // always server-derived from req.user, never client-supplied.
  patientVisibilityUpdatedByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<MedicalRecordDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    attendingDentistId: { type: Schema.Types.ObjectId, ref: "Dentist" },
    authorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recordType: { type: String, enum: MEDICAL_RECORD_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: MEDICAL_RECORD_TITLE_MAX_LENGTH },
    // Plain text only - never HTML. Enforced at the API boundary (zod) as
    // well; the model layer only trims/bounds length.
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: MEDICAL_RECORD_DESCRIPTION_MAX_LENGTH,
    },
    recordDate: { type: Date, required: true },
    status: {
      type: String,
      enum: MEDICAL_RECORD_STATUSES,
      default: "draft",
      required: true,
      index: true,
    },
    finalizedAt: { type: Date },
    amendedRecordId: { type: Schema.Types.ObjectId, ref: "MedicalRecord" },
    amendmentReason: {
      type: String,
      trim: true,
      maxlength: MEDICAL_RECORD_AMENDMENT_REASON_MAX_LENGTH,
    },
    idempotencyKey: { type: String, trim: true },
    patientVisible: { type: Boolean, default: false, required: true },
    patientVisibilityUpdatedAt: { type: Date },
    patientVisibilityUpdatedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Primary patient-history query: "this patient's records, newest first" -
// always clinic-scoped first so the index can never be used to cross a
// tenant boundary.
medicalRecordSchema.index({ clinicId: 1, patientId: 1, recordDate: -1 });
// Supports "records tied to this appointment" lookups (e.g. from an
// appointment detail view in a future milestone).
medicalRecordSchema.index({ clinicId: 1, appointmentId: 1 });
// Supports "this dentist's clinical record history" lookups.
medicalRecordSchema.index({ clinicId: 1, attendingDentistId: 1, recordDate: -1 });
// Supports safely listing every amendment for a given original record,
// clinic-scoped.
medicalRecordSchema.index({ clinicId: 1, amendedRecordId: 1 });
// Dedupes a duplicate/retried amendment submission against the same original
// record - scoped per original (not global) and partial so plain
// create/update documents (no idempotencyKey) are unaffected.
medicalRecordSchema.index(
  { clinicId: 1, amendedRecordId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true } } },
);
// Supports the patient-portal list/detail queries, which always filter on
// this exact field combination (clinicId + patientId + status:"finalized" +
// patientVisible:true, further narrowed to originals-only via amendedRecordId
// absent, sorted by recordDate descending).
medicalRecordSchema.index({
  clinicId: 1,
  patientId: 1,
  status: 1,
  patientVisible: 1,
  amendedRecordId: 1,
  recordDate: -1,
});

export const MedicalRecord =
  (models.MedicalRecord as Model<MedicalRecordDocument>) ||
  model<MedicalRecordDocument>("MedicalRecord", medicalRecordSchema);
