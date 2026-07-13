import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export interface PatientDocument extends Document {
  clinicId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<PatientDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Patient =
  (models.Patient as Model<PatientDocument>) || model<PatientDocument>("Patient", patientSchema);
