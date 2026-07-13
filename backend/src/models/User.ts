import { Schema, model, models, Types, type Document, type Model } from "mongoose";

export type UserRole = "admin" | "staff" | "patient";

export interface UserDocument extends Document {
  clinicId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
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
  },
  { timestamps: true },
);

export const User =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);
