import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export type UserRole = "admin" | "staff" | "patient";

export interface UserDocument extends Document {
  clinicId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  // Only ever set when role === "patient" - links this login to exactly one
  // Patient record. Admin/staff Users must never have this field.
  patientId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "staff", "patient"],
      default: "admin",
      required: true,
    },
    // Default true so every pre-existing user (created before this field
    // existed) is implicitly still active.
    isActive: { type: Boolean, default: true, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
  },
  { timestamps: true },
);

// Sparse so admin/staff Users (which never set this field) don't collide on
// the unique constraint - only enforces "one portal account per Patient."
userSchema.index({ patientId: 1 }, { unique: true, sparse: true });

export const User =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);
