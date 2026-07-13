import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export interface DentistDocument extends Document {
  clinicId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dentistSchema = new Schema<DentistDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    specialty: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Dentist =
  (models.Dentist as Model<DentistDocument>) || model<DentistDocument>("Dentist", dentistSchema);
