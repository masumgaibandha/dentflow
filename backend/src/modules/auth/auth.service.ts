import bcrypt from "bcrypt";
import { Clinic, type ClinicDocument } from "../../models/Clinic";
import { User } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken } from "../../utils/jwt";
import { slugify } from "../../utils/slugify";
import type { LoginInput, RegisterInput } from "./auth.validation";

const SALT_ROUNDS = 12;

async function generateUniqueClinicSlug(clinicName: string): Promise<string> {
  const base = slugify(clinicName) || "clinic";
  let candidate = base;
  let suffix = 2;

  while (await Clinic.exists({ slug: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function ensureClinicHasSlug(clinic: ClinicDocument): Promise<ClinicDocument> {
  if (clinic.slug) {
    return clinic;
  }

  clinic.slug = await generateUniqueClinicSlug(clinic.name);
  await clinic.save();
  return clinic;
}

function toAuthResponse(
  token: string,
  user: { _id: unknown; name: string; email: string; role: string },
  clinic: { _id: unknown; name: string; slug?: string },
) {
  return {
    token,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    clinic: { id: String(clinic._id), name: clinic.name, slug: clinic.slug },
  };
}

export async function registerClinicAdmin(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists", "EMAIL_TAKEN");
  }

  // Deadline simplification: Clinic + User are created sequentially rather than
  // inside a Mongo session transaction. A failure between the two steps (or a
  // duplicate-email race) can leave an orphaned Clinic - acceptable risk for a
  // single-admin registration flow tonight, worth revisiting before real traffic.
  const slug = await generateUniqueClinicSlug(input.clinicName);
  const clinic = await Clinic.create({ name: input.clinicName, slug });
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    clinicId: clinic._id,
    name: input.adminName,
    email: input.email,
    passwordHash,
    role: "admin",
  });

  const token = signAccessToken({
    userId: user._id.toString(),
    clinicId: clinic._id.toString(),
    role: user.role,
  });

  return toAuthResponse(token, user, clinic);
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const clinicRecord = await Clinic.findById(user.clinicId);
  if (!clinicRecord) {
    throw new ApiError(500, "Clinic record missing for user", "DATA_INTEGRITY_ERROR");
  }
  const clinic = await ensureClinicHasSlug(clinicRecord);

  const token = signAccessToken({
    userId: user._id.toString(),
    clinicId: user.clinicId.toString(),
    role: user.role,
  });

  return toAuthResponse(token, user, clinic);
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "User not found", "UNAUTHENTICATED");
  }

  const clinicRecord = await Clinic.findById(user.clinicId);
  if (!clinicRecord) {
    throw new ApiError(500, "Clinic record missing for user", "DATA_INTEGRITY_ERROR");
  }
  const clinic = await ensureClinicHasSlug(clinicRecord);

  return {
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    clinic: { id: clinic._id.toString(), name: clinic.name, slug: clinic.slug },
  };
}
