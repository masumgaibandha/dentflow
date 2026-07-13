import type { FilterQuery } from "mongoose";
import { Appointment, type AppointmentDocument } from "../../models/Appointment";
import { Clinic } from "../../models/Clinic";
import { Patient } from "../../models/Patient";
import { User } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import type { PortalAppointmentsQuery } from "./portal.validation";

const DENTIST_POPULATE = { path: "dentistId", select: "name clinicId" };
const TREATMENT_POPULATE = { path: "treatmentId", select: "title clinicId" };

// clinicId and patientId here always come from the live, requireAuth-resolved
// User record (req.user) - never from a route/query param, and never trusted
// from the JWT payload directly. This endpoint takes no client-supplied ID at
// all, which is what makes it un-attackable by construction.
export async function getPortalMe(userId: string, clinicId: string, patientId: string) {
  const [patient, clinic, user] = await Promise.all([
    Patient.findById(patientId),
    Clinic.findById(clinicId),
    User.findById(userId),
  ]);

  if (!patient || patient.clinicId.toString() !== clinicId) {
    throw new ApiError(500, "Linked patient record not found", "DATA_INTEGRITY_ERROR");
  }
  if (!clinic) {
    throw new ApiError(500, "Clinic record missing", "DATA_INTEGRITY_ERROR");
  }
  if (!user) {
    throw new ApiError(401, "User not found", "UNAUTHENTICATED");
  }

  return {
    id: patient._id.toString(),
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    clinic: { name: clinic.name },
    // The portal account's own login email (may differ from the patient's
    // clinical/contact email above) - shown so the patient knows what they
    // log in with.
    portalEmail: user.email,
  };
}

// Definitions (single source of truth for Portal 2):
//   upcoming: startTime >= now (server clock, the same absolute UTC instant
//             stored on the Appointment - no clinic-timezone adjustment).
//   past:     startTime < now.
// All statuses (scheduled, completed, cancelled) are included in both
// buckets and returned as-is - filtering by status is not offered here, the
// patient sees their full history/schedule with status displayed plainly.
function toPortalAppointmentDto(appointment: AppointmentDocument, clinicId: string) {
  const dentist = appointment.dentistId as unknown as
    | { name: string; clinicId: { toString(): string } }
    | undefined;
  const treatment = appointment.treatmentId as unknown as
    | { title: string; clinicId: { toString(): string } }
    | undefined;

  // Defense in depth: even if a corrupted reference ever pointed at another
  // clinic's Dentist/Treatment document, populate would still fetch it - this
  // check is what actually prevents that document's name from being exposed.
  const dentistName = dentist && dentist.clinicId.toString() === clinicId ? dentist.name : null;
  const treatmentTitle =
    treatment && treatment.clinicId.toString() === clinicId ? treatment.title : null;

  return {
    id: appointment._id.toString(),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    dentist: dentistName ? { name: dentistName } : null,
    treatment: treatmentTitle ? { title: treatmentTitle } : null,
  };
}

export async function getPortalAppointments(
  clinicId: string,
  patientId: string,
  query: PortalAppointmentsQuery,
) {
  const now = new Date();

  // Both clinicId and patientId come from the live, requireAuth-resolved
  // User record - this filter can never be widened by any query parameter.
  const filter: FilterQuery<AppointmentDocument> = {
    clinicId,
    patientId,
    startTime: query.when === "upcoming" ? { $gte: now } : { $lt: now },
  };

  const defaultSortOrder = query.when === "upcoming" ? "asc" : "desc";
  const direction: 1 | -1 = (query.sortOrder ?? defaultSortOrder) === "asc" ? 1 : -1;
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ startTime: direction })
      .skip(skip)
      .limit(query.limit)
      .populate(DENTIST_POPULATE)
      .populate(TREATMENT_POPULATE),
    Appointment.countDocuments(filter),
  ]);

  return {
    data: items.map((appointment) => toPortalAppointmentDto(appointment, clinicId)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
