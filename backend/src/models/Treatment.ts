import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export const TREATMENT_CATEGORIES = [
  "Preventive",
  "Restorative",
  "Cosmetic",
  "Orthodontic",
  "Surgical",
  "Pediatric",
] as const;

export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];

export interface TreatmentDocument extends Document {
  clinicId: Types.ObjectId;
  // Optional - the public catalog and details pages fall back to a local
  // illustration (see frontend TreatmentImage) whenever this is unset.
  imageUrl?: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  durationMinutes: number;
  category: TreatmentCategory;
  // Defaults true so every existing treatment stays visible/bookable with no
  // migration step; only relevant consumer today is the patient portal's
  // booking lookup, which filters to isActive: true.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const treatmentSchema = new Schema<TreatmentDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    imageUrl: { type: String, required: false, trim: true },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 1 },
    category: { type: String, enum: TREATMENT_CATEGORIES, required: true },
    isActive: { type: Boolean, default: true, required: true },
  },
  { timestamps: true },
);

export const Treatment =
  (models.Treatment as Model<TreatmentDocument>) ||
  model<TreatmentDocument>("Treatment", treatmentSchema);
