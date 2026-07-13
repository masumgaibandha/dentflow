import { Clinic } from "../../models/Clinic";
import { Patient } from "../../models/Patient";
import { User } from "../../models/User";
import { ApiError } from "../../utils/ApiError";

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
