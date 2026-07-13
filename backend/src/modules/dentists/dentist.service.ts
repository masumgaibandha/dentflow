import type { FilterQuery } from "mongoose";
import { Dentist, type DentistDocument } from "../../models/Dentist";
import { ApiError } from "../../utils/ApiError";
import type { DentistInput, ListDentistsQuery, UpdateDentistInput } from "./dentist.validation";

function toDentistDto(dentist: DentistDocument) {
  return {
    id: dentist._id.toString(),
    clinicId: dentist.clinicId.toString(),
    name: dentist.name,
    email: dentist.email,
    phone: dentist.phone,
    specialty: dentist.specialty,
    createdAt: dentist.createdAt,
    updatedAt: dentist.updatedAt,
  };
}

function buildFilter(clinicId: string, query: ListDentistsQuery): FilterQuery<DentistDocument> {
  const filter: FilterQuery<DentistDocument> = { clinicId };

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { specialty: regex }];
  }

  return filter;
}

function buildSort(query: ListDentistsQuery): Record<string, 1 | -1> {
  const direction = query.sortOrder === "asc" ? 1 : -1;
  const field = query.sortBy === "name" ? "name" : "createdAt";
  return { [field]: direction };
}

export async function listDentists(clinicId: string, query: ListDentistsQuery) {
  const filter = buildFilter(clinicId, query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Dentist.find(filter).sort(sort).skip(skip).limit(query.limit),
    Dentist.countDocuments(filter),
  ]);

  return {
    data: items.map(toDentistDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getDentistById(id: string, clinicId: string) {
  const dentist = await Dentist.findById(id);
  if (!dentist || dentist.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Dentist not found", "NOT_FOUND");
  }
  return toDentistDto(dentist);
}

export async function createDentist(clinicId: string, input: DentistInput) {
  const dentist = await Dentist.create({ ...input, clinicId });
  return toDentistDto(dentist);
}

export async function updateDentist(id: string, clinicId: string, input: UpdateDentistInput) {
  const dentist = await Dentist.findById(id);
  if (!dentist || dentist.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Dentist not found", "NOT_FOUND");
  }

  Object.assign(dentist, input);
  await dentist.save();
  return toDentistDto(dentist);
}

export async function deleteDentist(id: string, clinicId: string): Promise<void> {
  const dentist = await Dentist.findById(id);
  if (!dentist || dentist.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Dentist not found", "NOT_FOUND");
  }

  await dentist.deleteOne();
}
