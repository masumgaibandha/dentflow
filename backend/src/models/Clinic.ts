import { Schema, model, models, type Document, type Model } from "mongoose";

export interface ClinicDocument extends Document {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clinicSchema = new Schema<ClinicDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true },
);

export const Clinic =
  (models.Clinic as Model<ClinicDocument>) || model<ClinicDocument>("Clinic", clinicSchema);
