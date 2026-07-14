import { Schema, model, models, type Document, type Model } from "mongoose";

// Deliberately NOT clinic-scoped - this is a message to the DentFlow product/
// company itself (from the public marketing site), not data belonging to any
// one tenant. No cross-tenant isolation concern applies here because there is
// no tenant at all on this path.
export interface ContactMessageDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5_000 },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage =
  (models.ContactMessage as Model<ContactMessageDocument>) ||
  model<ContactMessageDocument>("ContactMessage", contactMessageSchema);
