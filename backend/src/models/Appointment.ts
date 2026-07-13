import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface AppointmentDocument extends Document {
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  dentistId: Types.ObjectId;
  treatmentId?: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  // Only set on patient-portal-created appointments, to dedupe rapid
  // duplicate/retried booking submissions from the same form attempt. Never
  // present on admin/staff-created appointments.
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    dentistId: { type: Schema.Types.ObjectId, ref: "Dentist", required: true, index: true },
    treatmentId: { type: Schema.Types.ObjectId, ref: "Treatment" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: "scheduled",
      required: true,
      index: true,
    },
    notes: { type: String, trim: true },
    idempotencyKey: { type: String, trim: true },
  },
  { timestamps: true },
);

// Supports the dentist-overlap check (clinicId + dentistId + status filter, range on startTime/endTime).
appointmentSchema.index({ clinicId: 1, dentistId: 1, status: 1, startTime: 1 });
// Supports the patient-overlap check (same shape, keyed on patientId instead of dentistId).
appointmentSchema.index({ clinicId: 1, patientId: 1, status: 1, startTime: 1 });
// Supports date-range list queries scoped to a clinic.
appointmentSchema.index({ clinicId: 1, startTime: 1 });
// Dedupes a patient's own duplicate/retried booking submissions - scoped per
// patient (not global) so two different patients can never collide, and
// partial so admin-created appointments (no idempotencyKey) are unaffected.
appointmentSchema.index(
  { clinicId: 1, patientId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true } } },
);

export const Appointment =
  (models.Appointment as Model<AppointmentDocument>) ||
  model<AppointmentDocument>("Appointment", appointmentSchema);
