import type { FilterQuery } from "mongoose";
import { Patient, type PatientDocument } from "../../models/Patient";
import { ApiError } from "../../utils/ApiError";
import type { ListPatientsQuery, PatientInput, UpdatePatientInput } from "./patient.validation";

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

export async function listPatients(clinicId: string, query: ListPatientsQuery) {
  const filter = buildFilter(clinicId, query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Patient.find(filter).sort(sort).skip(skip).limit(query.limit),
    Patient.countDocuments(filter),
  ]);

  return {
    data: items.map(toPatientDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getPatientById(id: string, clinicId: string) {
  const patient = await Patient.findById(id);
  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Patient not found", "NOT_FOUND");
  }
  return toPatientDto(patient);
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
