import { Clinic, type ClinicDocument } from "../../models/Clinic";
import { ApiError } from "../../utils/ApiError";
import type { UpdateClinicInput } from "./clinic.validation";

function toClinicDto(clinic: ClinicDocument) {
  return {
    id: clinic._id.toString(),
    name: clinic.name,
    slug: clinic.slug,
    address: clinic.address,
    phone: clinic.phone,
    email: clinic.email,
    timezone: clinic.timezone,
    // Absent (undefined) when never configured - the frontend uses this to
    // show a "hours not configured" state rather than assuming a default.
    weeklyHours: clinic.weeklyHours,
    createdAt: clinic.createdAt,
    updatedAt: clinic.updatedAt,
  };
}

export async function getMyClinic(clinicId: string) {
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) {
    throw new ApiError(500, "Clinic record missing for user", "DATA_INTEGRITY_ERROR");
  }
  return toClinicDto(clinic);
}

export async function updateMyClinic(clinicId: string, input: UpdateClinicInput) {
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) {
    throw new ApiError(500, "Clinic record missing for user", "DATA_INTEGRITY_ERROR");
  }

  // `input` only ever contains the allowlisted fields validated by
  // updateClinicSchema (.strict() already rejected anything else) - slug,
  // invoiceSequence, _id, and the timestamps are never touched here.
  Object.assign(clinic, input);
  await clinic.save();
  return toClinicDto(clinic);
}
