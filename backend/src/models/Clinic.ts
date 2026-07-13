import { Schema, model, models, type Document, type Model } from "mongoose";

export interface ClinicDocument extends Document {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  // IANA timezone name (e.g. "America/New_York"). No settings UI sets this
  // yet - when absent, dashboard date-boundary calculations fall back to
  // utils/timezone.ts's DEFAULT_TIMEZONE ("UTC"), never a hardcoded clinic.
  timezone?: string;
  invoiceSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const clinicSchema = new Schema<ClinicDocument>(
  {
    name: { type: String, required: true, trim: true },
    // sparse (not required at the schema level) so clinics created before this
    // field existed don't collide on the unique index - the app layer always
    // generates one for new clinics going forward.
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    timezone: { type: String, trim: true },
    // Incremented atomically (via $inc) to generate unique per-clinic invoice numbers.
    invoiceSequence: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Clinic =
  (models.Clinic as Model<ClinicDocument>) || model<ClinicDocument>("Clinic", clinicSchema);
