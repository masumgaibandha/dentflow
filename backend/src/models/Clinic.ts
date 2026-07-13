import { Schema, model, models, type Document, type Model } from "mongoose";

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

// openTime/closeTime are strict 24h "HH:mm" strings, only present when the
// day is open. A single continuous range per day - no split shifts/breaks,
// no overnight ranges (openTime must be earlier than closeTime), enforced by
// clinic.validation.ts at the API boundary.
export interface DayHours {
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export type WeeklyHours = Record<Weekday, DayHours>;

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
  // Absent entirely = not configured yet - never silently defaulted to
  // "open 24/7" or any other assumed schedule. Once set (via Clinic
  // Settings), all seven days are always present together.
  weeklyHours?: WeeklyHours;
  invoiceSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const dayHoursSchema = new Schema<DayHours>(
  {
    isClosed: { type: Boolean, required: true },
    openTime: { type: String, trim: true },
    closeTime: { type: String, trim: true },
  },
  { _id: false },
);

const weeklyHoursSchema = new Schema<WeeklyHours>(
  {
    monday: { type: dayHoursSchema, required: true },
    tuesday: { type: dayHoursSchema, required: true },
    wednesday: { type: dayHoursSchema, required: true },
    thursday: { type: dayHoursSchema, required: true },
    friday: { type: dayHoursSchema, required: true },
    saturday: { type: dayHoursSchema, required: true },
    sunday: { type: dayHoursSchema, required: true },
  },
  { _id: false },
);

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
    weeklyHours: { type: weeklyHoursSchema },
    // Incremented atomically (via $inc) to generate unique per-clinic invoice numbers.
    invoiceSequence: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Clinic =
  (models.Clinic as Model<ClinicDocument>) || model<ClinicDocument>("Clinic", clinicSchema);
