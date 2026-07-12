import type { FilterQuery } from "mongoose";
import { Clinic } from "../../models/Clinic";
import { Treatment, type TreatmentDocument } from "../../models/Treatment";
import { ApiError } from "../../utils/ApiError";
import type {
  ListTreatmentsQuery,
  TreatmentInput,
  UpdateTreatmentInput,
} from "./treatment.validation";

function toTreatmentDto(treatment: TreatmentDocument) {
  return {
    id: treatment._id.toString(),
    clinicId: treatment.clinicId.toString(),
    imageUrl: treatment.imageUrl,
    title: treatment.title,
    shortDescription: treatment.shortDescription,
    fullDescription: treatment.fullDescription,
    price: treatment.price,
    durationMinutes: treatment.durationMinutes,
    category: treatment.category,
    createdAt: treatment.createdAt,
    updatedAt: treatment.updatedAt,
  };
}

async function resolveClinicIdBySlug(slug: string): Promise<string> {
  const clinic = await Clinic.findOne({ slug });
  if (!clinic) {
    throw new ApiError(404, "Clinic not found", "CLINIC_NOT_FOUND");
  }
  return clinic._id.toString();
}

function buildFilter(
  clinicId: string,
  query: ListTreatmentsQuery,
): FilterQuery<TreatmentDocument> {
  const filter: FilterQuery<TreatmentDocument> = { clinicId };

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ title: regex }, { shortDescription: regex }];
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {
      ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
    };
  }

  return filter;
}

function buildSort(query: ListTreatmentsQuery): Record<string, 1 | -1> {
  const direction = query.sortOrder === "asc" ? 1 : -1;
  const field =
    query.sortBy === "price" ? "price" : query.sortBy === "title" ? "title" : "createdAt";
  return { [field]: direction };
}

async function listTreatments(clinicId: string, query: ListTreatmentsQuery) {
  const filter = buildFilter(clinicId, query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Treatment.find(filter).sort(sort).skip(skip).limit(query.limit),
    Treatment.countDocuments(filter),
  ]);

  return {
    data: items.map(toTreatmentDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function listTreatmentsForPublicClinic(slug: string, query: ListTreatmentsQuery) {
  const clinicId = await resolveClinicIdBySlug(slug);
  return listTreatments(clinicId, query);
}

export async function listTreatmentsForAdmin(clinicId: string, query: ListTreatmentsQuery) {
  return listTreatments(clinicId, query);
}

export async function getPublicTreatmentById(id: string, slug: string) {
  const clinicId = await resolveClinicIdBySlug(slug);
  const treatment = await Treatment.findById(id);
  if (!treatment || treatment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Treatment not found", "NOT_FOUND");
  }
  return toTreatmentDto(treatment);
}

export async function getAdminTreatmentById(id: string, clinicId: string) {
  const treatment = await Treatment.findById(id);
  if (!treatment || treatment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Treatment not found", "NOT_FOUND");
  }
  return toTreatmentDto(treatment);
}

export async function createTreatment(clinicId: string, input: TreatmentInput) {
  const treatment = await Treatment.create({ ...input, clinicId });
  return toTreatmentDto(treatment);
}

export async function updateTreatment(
  id: string,
  clinicId: string,
  input: UpdateTreatmentInput,
) {
  const treatment = await Treatment.findById(id);
  if (!treatment || treatment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Treatment not found", "NOT_FOUND");
  }

  Object.assign(treatment, input);
  await treatment.save();
  return toTreatmentDto(treatment);
}

export async function deleteTreatment(id: string, clinicId: string): Promise<void> {
  const treatment = await Treatment.findById(id);
  if (!treatment || treatment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Treatment not found", "NOT_FOUND");
  }

  await treatment.deleteOne();
}
