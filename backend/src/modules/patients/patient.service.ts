import bcrypt from "bcrypt";
import type { FilterQuery, Types } from "mongoose";
import { Patient, type PatientDocument } from "../../models/Patient";
import { User, type UserRole } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import type {
  CreatePortalAccountInput,
  ListPatientsQuery,
  PatientInput,
  UpdatePatientInput,
} from "./patient.validation";

// Matches the bcrypt configuration used everywhere else credentials are hashed
// (auth.service.ts's registration flow, user.service.ts's staff creation).
const SALT_ROUNDS = 12;

function toPatientDto(patient: PatientDocument) {
  return {
    id: patient._id.toString(),
    clinicId: patient.clinicId.toString(),
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    notes: patient.notes,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

export interface PortalAccountInfo {
  id: string;
  email: string;
  isActive: boolean;
}

// Portal-account details (login email, user id, active status) are
// admin-only - staff get the plain clinical/demographic patient DTO with no
// trace of this field, not even as null.
async function attachPortalAccounts<T extends { id: string }>(
  patients: T[],
  patientObjectIds: Types.ObjectId[],
): Promise<(T & { portalAccount: PortalAccountInfo | null })[]> {
  const portalUsers = await User.find({ patientId: { $in: patientObjectIds }, role: "patient" });
  const byPatientId = new Map(
    portalUsers.map((user) => [
      user.patientId!.toString(),
      { id: user._id.toString(), email: user.email, isActive: user.isActive },
    ]),
  );

  return patients.map((patient) => ({
    ...patient,
    portalAccount: byPatientId.get(patient.id) ?? null,
  }));
}

function buildFilter(clinicId: string, query: ListPatientsQuery): FilterQuery<PatientDocument> {
  const filter: FilterQuery<PatientDocument> = { clinicId };

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  return filter;
}

function buildSort(query: ListPatientsQuery): Record<string, 1 | -1> {
  const direction = query.sortOrder === "asc" ? 1 : -1;
  const field = query.sortBy === "name" ? "name" : "createdAt";
  return { [field]: direction };
}

export async function listPatients(clinicId: string, query: ListPatientsQuery, requestingRole: UserRole) {
  const filter = buildFilter(clinicId, query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Patient.find(filter).sort(sort).skip(skip).limit(query.limit),
    Patient.countDocuments(filter),
  ]);

  const dtos = items.map(toPatientDto);
  const data =
    requestingRole === "admin"
      ? await attachPortalAccounts(
          dtos,
          items.map((item) => item._id),
        )
      : dtos;

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getPatientById(id: string, clinicId: string, requestingRole: UserRole) {
  const patient = await Patient.findById(id);
  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Patient not found", "NOT_FOUND");
  }

  const dto = toPatientDto(patient);
  if (requestingRole === "admin") {
    const [withPortalAccount] = await attachPortalAccounts([dto], [patient._id]);
    return withPortalAccount;
  }
  return dto;
}

export async function createPatient(clinicId: string, input: PatientInput) {
  const patient = await Patient.create({ ...input, clinicId });
  return toPatientDto(patient);
}

export async function updatePatient(id: string, clinicId: string, input: UpdatePatientInput) {
  const patient = await Patient.findById(id);
  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Patient not found", "NOT_FOUND");
  }

  Object.assign(patient, input);
  await patient.save();
  return toPatientDto(patient);
}

export async function deletePatient(id: string, clinicId: string): Promise<void> {
  const patient = await Patient.findById(id);
  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Patient not found", "NOT_FOUND");
  }

  await patient.deleteOne();
}

export async function createPortalAccount(
  patientId: string,
  clinicId: string,
  input: CreatePortalAccountInput,
): Promise<PortalAccountInfo> {
  const patient = await Patient.findById(patientId);
  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Patient not found", "NOT_FOUND");
  }

  const alreadyLinked = await User.findOne({ patientId: patient._id, role: "patient" });
  if (alreadyLinked) {
    throw new ApiError(
      409,
      "This patient already has a portal account",
      "PORTAL_ACCOUNT_EXISTS",
    );
  }

  const existingEmail = await User.findOne({ email: input.email });
  if (existingEmail) {
    throw new ApiError(409, "An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.initialPassword, SALT_ROUNDS);
  // Name is always derived from the existing Patient record, never accepted
  // from the request body - the strict validation schema (email +
  // initialPassword only) already makes this the only possible outcome.
  const user = await User.create({
    clinicId,
    patientId: patient._id,
    name: patient.name,
    email: input.email,
    passwordHash,
    role: "patient",
    isActive: true,
  });

  return { id: user._id.toString(), email: user.email, isActive: user.isActive };
}
