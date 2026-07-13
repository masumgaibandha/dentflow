import type { FilterQuery, Model, Types } from "mongoose";
import { Appointment, type AppointmentDocument } from "../../models/Appointment";
import { Dentist } from "../../models/Dentist";
import { Patient } from "../../models/Patient";
import { Treatment } from "../../models/Treatment";
import { ApiError } from "../../utils/ApiError";
import type {
  AppointmentInput,
  ListAppointmentsQuery,
  UpdateAppointmentInput,
} from "./appointment.validation";

const PATIENT_POPULATE = { path: "patientId", select: "name email phone" };
const DENTIST_POPULATE = { path: "dentistId", select: "name specialty" };
const TREATMENT_POPULATE = { path: "treatmentId", select: "title durationMinutes price" };

function toAppointmentDto(appointment: AppointmentDocument) {
  const patient = appointment.patientId as unknown as
    | { _id: unknown; name: string; email?: string; phone?: string }
    | undefined;
  const dentist = appointment.dentistId as unknown as
    | { _id: unknown; name: string; specialty?: string }
    | undefined;
  const treatment = appointment.treatmentId as unknown as
    | { _id: unknown; title: string; durationMinutes: number; price: number }
    | undefined;

  return {
    id: appointment._id.toString(),
    clinicId: appointment.clinicId.toString(),
    patient: patient
      ? { id: String(patient._id), name: patient.name, email: patient.email, phone: patient.phone }
      : { id: appointment.patientId.toString() },
    dentist: dentist
      ? { id: String(dentist._id), name: dentist.name, specialty: dentist.specialty }
      : { id: appointment.dentistId.toString() },
    treatment:
      treatment && treatment._id
        ? {
            id: String(treatment._id),
            title: treatment.title,
            durationMinutes: treatment.durationMinutes,
            price: treatment.price,
          }
        : appointment.treatmentId
          ? { id: appointment.treatmentId.toString() }
          : null,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

async function assertBelongsToClinic<T extends { clinicId: Types.ObjectId }>(
  RefModel: Model<T>,
  id: string,
  clinicId: string,
  label: string,
): Promise<void> {
  const doc = await RefModel.findById(id);
  if (!doc || doc.clinicId.toString() !== clinicId) {
    throw new ApiError(404, `${label} not found`, "NOT_FOUND");
  }
}

async function assertNoOverlap(
  clinicId: string,
  dentistId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string,
): Promise<void> {
  const filter: FilterQuery<AppointmentDocument> = {
    clinicId,
    dentistId,
    status: { $ne: "cancelled" },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const conflict = await Appointment.findOne(filter);
  if (conflict) {
    throw new ApiError(
      409,
      "This dentist already has an appointment during that time range",
      "APPOINTMENT_OVERLAP",
    );
  }
}

function buildFilter(
  clinicId: string,
  query: ListAppointmentsQuery,
): FilterQuery<AppointmentDocument> {
  const filter: FilterQuery<AppointmentDocument> = { clinicId };

  if (query.patientId) filter.patientId = query.patientId;
  if (query.dentistId) filter.dentistId = query.dentistId;
  if (query.status) filter.status = query.status;

  if (query.dateFrom || query.dateTo) {
    filter.startTime = {
      ...(query.dateFrom ? { $gte: query.dateFrom } : {}),
      ...(query.dateTo ? { $lte: query.dateTo } : {}),
    };
  }

  return filter;
}

function buildSort(query: ListAppointmentsQuery): Record<string, 1 | -1> {
  const direction = query.sortOrder === "asc" ? 1 : -1;
  const field = query.sortBy === "newest" ? "createdAt" : "startTime";
  return { [field]: direction };
}

export async function listAppointments(clinicId: string, query: ListAppointmentsQuery) {
  const filter = buildFilter(clinicId, query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate(PATIENT_POPULATE)
      .populate(DENTIST_POPULATE)
      .populate(TREATMENT_POPULATE),
    Appointment.countDocuments(filter),
  ]);

  return {
    data: items.map(toAppointmentDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getAppointmentById(id: string, clinicId: string) {
  const appointment = await Appointment.findById(id)
    .populate(PATIENT_POPULATE)
    .populate(DENTIST_POPULATE)
    .populate(TREATMENT_POPULATE);
  if (!appointment || appointment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Appointment not found", "NOT_FOUND");
  }
  return toAppointmentDto(appointment);
}

export async function createAppointment(clinicId: string, input: AppointmentInput) {
  await assertBelongsToClinic(Patient, input.patientId, clinicId, "Patient");
  await assertBelongsToClinic(Dentist, input.dentistId, clinicId, "Dentist");
  if (input.treatmentId) {
    await assertBelongsToClinic(Treatment, input.treatmentId, clinicId, "Treatment");
  }

  await assertNoOverlap(clinicId, input.dentistId, input.startTime, input.endTime);

  const appointment = await Appointment.create({ ...input, clinicId });
  return getAppointmentById(appointment._id.toString(), clinicId);
}

export async function updateAppointment(
  id: string,
  clinicId: string,
  input: UpdateAppointmentInput,
) {
  const appointment = await Appointment.findById(id);
  if (!appointment || appointment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Appointment not found", "NOT_FOUND");
  }

  if (input.patientId) {
    await assertBelongsToClinic(Patient, input.patientId, clinicId, "Patient");
  }
  if (input.dentistId) {
    await assertBelongsToClinic(Dentist, input.dentistId, clinicId, "Dentist");
  }
  if (input.treatmentId) {
    await assertBelongsToClinic(Treatment, input.treatmentId, clinicId, "Treatment");
  }

  const nextDentistId = input.dentistId ?? appointment.dentistId.toString();
  const nextStartTime = input.startTime ?? appointment.startTime;
  const nextEndTime = input.endTime ?? appointment.endTime;

  if (nextEndTime.getTime() <= nextStartTime.getTime()) {
    throw new ApiError(400, "endTime must be later than startTime", "VALIDATION_ERROR");
  }

  const nextStatus = input.status ?? appointment.status;
  if (nextStatus !== "cancelled") {
    await assertNoOverlap(clinicId, nextDentistId, nextStartTime, nextEndTime, id);
  }

  Object.assign(appointment, input);
  await appointment.save();
  return getAppointmentById(id, clinicId);
}

export async function cancelAppointment(id: string, clinicId: string) {
  const appointment = await Appointment.findById(id);
  if (!appointment || appointment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Appointment not found", "NOT_FOUND");
  }

  appointment.status = "cancelled";
  await appointment.save();
  return getAppointmentById(id, clinicId);
}

export async function deleteAppointment(id: string, clinicId: string): Promise<void> {
  const appointment = await Appointment.findById(id);
  if (!appointment || appointment.clinicId.toString() !== clinicId) {
    throw new ApiError(404, "Appointment not found", "NOT_FOUND");
  }

  await appointment.deleteOne();
}
