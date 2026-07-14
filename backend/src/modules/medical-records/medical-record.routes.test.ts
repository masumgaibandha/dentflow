import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { Appointment } from "../../models/Appointment";
import { Clinic } from "../../models/Clinic";
import { Dentist } from "../../models/Dentist";
import { MedicalRecord } from "../../models/MedicalRecord";
import { Patient } from "../../models/Patient";
import { User, type UserRole } from "../../models/User";
import { signAccessToken } from "../../utils/jwt";

const app = createApp();
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

async function makeClinic(name = "Clinic") {
  return Clinic.create({ name, invoiceSequence: 0 });
}

async function makeUser(clinicId: Types.ObjectId, role: UserRole, patientId?: Types.ObjectId) {
  const passwordHash = await bcrypt.hash("password123", 4);
  const user = await User.create({
    clinicId,
    name: `${role}-${new Types.ObjectId().toString()}`,
    email: `${role}-${new Types.ObjectId().toString()}@test.com`,
    passwordHash,
    role,
    isActive: true,
    patientId,
  });
  const token = signAccessToken({
    userId: user._id.toString(),
    clinicId: clinicId.toString(),
    role,
  });
  return { user, token };
}

async function makePatient(clinicId: Types.ObjectId, name = "Test Patient") {
  return Patient.create({ clinicId, name });
}

async function makeDentist(clinicId: Types.ObjectId, name = "Test Dentist") {
  return Dentist.create({ clinicId, name, isActive: true });
}

async function makeAppointment(
  clinicId: Types.ObjectId,
  patientId: Types.ObjectId,
  dentistId: Types.ObjectId,
) {
  const startTime = new Date(Date.now() + 3_600_000);
  const endTime = new Date(startTime.getTime() + 1_800_000);
  return Appointment.create({
    clinicId,
    patientId,
    dentistId,
    startTime,
    endTime,
    status: "scheduled",
  });
}

interface Tenant {
  clinicId: Types.ObjectId;
  adminToken: string;
  staffToken: string;
  patientToken: string;
  patient: Awaited<ReturnType<typeof makePatient>>;
  dentist: Awaited<ReturnType<typeof makeDentist>>;
  appointment: Awaited<ReturnType<typeof makeAppointment>>;
}

async function makeTenant(label: string): Promise<Tenant> {
  const clinic = await makeClinic(`Clinic ${label}`);
  const patient = await makePatient(clinic._id, `Patient ${label}`);
  const dentist = await makeDentist(clinic._id, `Dentist ${label}`);
  const appointment = await makeAppointment(clinic._id, patient._id, dentist._id);
  const { token: adminToken } = await makeUser(clinic._id, "admin");
  const { token: staffToken } = await makeUser(clinic._id, "staff");
  const { token: patientToken } = await makeUser(clinic._id, "patient", patient._id);

  return {
    clinicId: clinic._id,
    adminToken,
    staffToken,
    patientToken,
    patient,
    dentist,
    appointment,
  };
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function validCreateBody(tenant: Tenant, overrides: Record<string, unknown> = {}) {
  return {
    patientId: tenant.patient._id.toString(),
    recordType: "consultation",
    title: "Initial consultation",
    description: "Patient reports mild sensitivity on the upper left molar.",
    ...overrides,
  };
}

async function createDraft(tenant: Tenant, overrides: Record<string, unknown> = {}) {
  const response = await request(app)
    .post("/api/medical-records")
    .set(auth(tenant.adminToken))
    .send(validCreateBody(tenant, overrides));
  return response;
}

describe("medical records - tenant isolation", () => {
  it("clinic A admin can create and read their own records", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);
    expect(created.status).toBe(201);

    const fetched = await request(app)
      .get(`/api/medical-records/${created.body.id}?patientId=${a.patient._id}`)
      .set(auth(a.adminToken));
    expect(fetched.status).toBe(200);
    expect(fetched.body.id).toBe(created.body.id);
  });

  it("clinic B cannot read clinic A's record by guessed id (404, not 403)", async () => {
    const a = await makeTenant("A");
    const b = await makeTenant("B");
    const created = await createDraft(a);

    const response = await request(app)
      .get(`/api/medical-records/${created.body.id}?patientId=${a.patient._id}`)
      .set(auth(b.adminToken));
    expect(response.status).toBe(404);
  });

  it("clinic B staff cannot update, delete, finalize, or amend clinic A's record", async () => {
    const a = await makeTenant("A");
    const b = await makeTenant("B");
    const created = await createDraft(a);
    const id = created.body.id;

    const update = await request(app)
      .patch(`/api/medical-records/${id}`)
      .set(auth(b.staffToken))
      .send({ title: "Hijacked" });
    expect(update.status).toBe(404);

    const del = await request(app).delete(`/api/medical-records/${id}`).set(auth(b.staffToken));
    expect(del.status).toBe(404);

    const finalizeRes = await request(app)
      .post(`/api/medical-records/${id}/finalize`)
      .set(auth(b.staffToken));
    expect(finalizeRes.status).toBe(404);

    const amendRes = await request(app)
      .post(`/api/medical-records/${id}/amendments`)
      .set(auth(b.staffToken))
      .set("Idempotency-Key", "key-1")
      .send({ title: "x", description: "y", amendmentReason: "z" });
    expect(amendRes.status).toBe(404);
  });

  it("clinic A staff only ever sees clinic A records in the list", async () => {
    const a = await makeTenant("A");
    const b = await makeTenant("B");
    await createDraft(a);
    await createDraft(b);

    const listA = await request(app)
      .get(`/api/medical-records?patientId=${a.patient._id}`)
      .set(auth(a.staffToken));
    expect(listA.status).toBe(200);
    expect(listA.body.data).toHaveLength(1);

    const listBUsingAPatientId = await request(app)
      .get(`/api/medical-records?patientId=${a.patient._id}`)
      .set(auth(b.staffToken));
    expect(listBUsingAPatientId.status).toBe(200);
    expect(listBUsingAPatientId.body.data).toHaveLength(0);
  });

  it("pagination cannot be used to see another clinic's records", async () => {
    const a = await makeTenant("A");
    const b = await makeTenant("B");
    for (let i = 0; i < 3; i += 1) {
      await createDraft(a);
    }

    const response = await request(app)
      .get(`/api/medical-records?patientId=${a.patient._id}&page=1&limit=50`)
      .set(auth(b.adminToken));
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.pagination.total).toBe(0);
  });
});

describe("medical records - role gating", () => {
  it("patient role receives 403 from every medical-record endpoint", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);
    const id = created.body.id;

    const endpoints: Array<() => request.Test> = [
      () => request(app).get(`/api/medical-records?patientId=${a.patient._id}`).set(auth(a.patientToken)),
      () => request(app).get(`/api/medical-records/${id}`).set(auth(a.patientToken)),
      () =>
        request(app)
          .post("/api/medical-records")
          .set(auth(a.patientToken))
          .send(validCreateBody(a)),
      () =>
        request(app)
          .patch(`/api/medical-records/${id}`)
          .set(auth(a.patientToken))
          .send({ title: "x" }),
      () => request(app).delete(`/api/medical-records/${id}`).set(auth(a.patientToken)),
      () => request(app).post(`/api/medical-records/${id}/finalize`).set(auth(a.patientToken)),
      () =>
        request(app)
          .post(`/api/medical-records/${id}/amendments`)
          .set(auth(a.patientToken))
          .set("Idempotency-Key", "k")
          .send({ title: "x", description: "y", amendmentReason: "z" }),
    ];

    for (const call of endpoints) {
      const response = await call();
      expect(response.status).toBe(403);
    }
  });

  it("unauthenticated requests are rejected", async () => {
    const response = await request(app).get("/api/medical-records?patientId=" + new Types.ObjectId());
    expect(response.status).toBe(401);
  });
});

describe("medical records - create validation", () => {
  it("rejects a client-supplied clinicId, authorUserId, or status (strict schema)", async () => {
    const a = await makeTenant("A");
    const other = await makeTenant("Other");

    for (const field of [
      { clinicId: other.clinicId.toString() },
      { authorUserId: new Types.ObjectId().toString() },
      { status: "finalized" },
      { finalizedAt: new Date().toISOString() },
      { amendedRecordId: new Types.ObjectId().toString() },
      { somethingUnknown: "value" },
    ]) {
      const response = await request(app)
        .post("/api/medical-records")
        .set(auth(a.adminToken))
        .send(validCreateBody(a, field));
      expect(response.status).toBe(400);
    }
  });

  it("server always sets initial status to draft, ignoring any client attempt", async () => {
    const a = await createDraftableTenant();
    const response = await createDraft(a);
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("draft");
  });

  it("rejects a cross-clinic patientId, dentistId, and appointmentId as 404", async () => {
    const a = await makeTenant("A");
    const b = await makeTenant("B");

    const badPatient = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { patientId: b.patient._id.toString() }));
    expect(badPatient.status).toBe(404);

    const badDentist = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { attendingDentistId: b.dentist._id.toString() }));
    expect(badDentist.status).toBe(404);

    const badAppointment = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { appointmentId: b.appointment._id.toString() }));
    expect(badAppointment.status).toBe(404);
  });

  it("rejects an appointment that belongs to a different patient in the same clinic", async () => {
    const a = await makeTenant("A");
    const otherPatient = await makePatient(a.clinicId, "Other Patient");

    const response = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(
        validCreateBody(a, {
          patientId: otherPatient._id.toString(),
          appointmentId: a.appointment._id.toString(),
        }),
      );
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("PATIENT_APPOINTMENT_MISMATCH");
  });

  it("rejects an attendingDentistId inconsistent with the linked appointment's dentist", async () => {
    const a = await makeTenant("A");
    const otherDentist = await makeDentist(a.clinicId, "Other Dentist");

    const response = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(
        validCreateBody(a, {
          appointmentId: a.appointment._id.toString(),
          attendingDentistId: otherDentist._id.toString(),
        }),
      );
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("DENTIST_APPOINTMENT_MISMATCH");
  });

  it("rejects invalid ObjectIds with a controlled 400", async () => {
    const a = await makeTenant("A");

    const badPatientId = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { patientId: "not-an-id" }));
    expect(badPatientId.status).toBe(400);

    const badGet = await request(app)
      .get("/api/medical-records/not-an-id")
      .set(auth(a.adminToken));
    expect(badGet.status).toBe(400);
  });

  it("rejects recordType 'prescription' (not part of this milestone's enum)", async () => {
    const a = await makeTenant("A");
    const response = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { recordType: "prescription" }));
    expect(response.status).toBe(400);
  });

  it("rejects an oversized title or description", async () => {
    const a = await makeTenant("A");
    const longTitle = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { title: "x".repeat(201) }));
    expect(longTitle.status).toBe(400);

    const longDescription = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { description: "x".repeat(10_001) }));
    expect(longDescription.status).toBe(400);
  });

  it("rejects a recordDate meaningfully in the future beyond the clock-skew allowance", async () => {
    const a = await makeTenant("A");
    const farFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const response = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { recordDate: farFuture }));
    expect(response.status).toBe(400);
  });

  it("accepts a backdated recordDate", async () => {
    const a = await makeTenant("A");
    const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const response = await request(app)
      .post("/api/medical-records")
      .set(auth(a.adminToken))
      .send(validCreateBody(a, { recordDate: past }));
    expect(response.status).toBe(201);
  });

  it("rejects unknown list query parameters", async () => {
    const a = await makeTenant("A");
    const response = await request(app)
      .get(`/api/medical-records?patientId=${a.patient._id}&clinicId=${a.clinicId}`)
      .set(auth(a.adminToken));
    expect(response.status).toBe(400);
  });
});

describe("medical records - draft and finalized lifecycle", () => {
  it("a draft can be edited by staff", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const response = await request(app)
      .patch(`/api/medical-records/${created.body.id}`)
      .set(auth(a.staffToken))
      .send({ title: "Updated title" });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated title");
  });

  it("rejects update payloads carrying immutable fields (strict schema)", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    for (const field of [
      { status: "finalized" },
      { authorUserId: new Types.ObjectId().toString() },
      { clinicId: new Types.ObjectId().toString() },
      { patientId: new Types.ObjectId().toString() },
    ]) {
      const response = await request(app)
        .patch(`/api/medical-records/${created.body.id}`)
        .set(auth(a.adminToken))
        .send(field);
      expect(response.status).toBe(400);
    }
  });

  it("a draft can be discarded (deleted)", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const del = await request(app)
      .delete(`/api/medical-records/${created.body.id}`)
      .set(auth(a.adminToken));
    expect(del.status).toBe(204);

    const fetched = await request(app)
      .get(`/api/medical-records/${created.body.id}`)
      .set(auth(a.adminToken));
    expect(fetched.status).toBe(404);
  });

  it("finalizing sets status and finalizedAt", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const response = await request(app)
      .post(`/api/medical-records/${created.body.id}/finalize`)
      .set(auth(a.adminToken));
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("finalized");
    expect(response.body.finalizedAt).toBeTruthy();
  });

  it("a finalized record cannot be edited (controlled 409)", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);
    await request(app).post(`/api/medical-records/${created.body.id}/finalize`).set(auth(a.adminToken));

    const response = await request(app)
      .patch(`/api/medical-records/${created.body.id}`)
      .set(auth(a.adminToken))
      .send({ title: "Should not apply" });
    expect(response.status).toBe(409);

    const stillOriginal = await request(app)
      .get(`/api/medical-records/${created.body.id}`)
      .set(auth(a.adminToken));
    expect(stillOriginal.body.title).not.toBe("Should not apply");
  });

  it("a finalized record cannot be deleted (controlled 409)", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);
    await request(app).post(`/api/medical-records/${created.body.id}/finalize`).set(auth(a.adminToken));

    const response = await request(app)
      .delete(`/api/medical-records/${created.body.id}`)
      .set(auth(a.adminToken));
    expect(response.status).toBe(409);
  });

  it("re-finalizing an already-finalized record returns a controlled 409, not a crash", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);
    const first = await request(app)
      .post(`/api/medical-records/${created.body.id}/finalize`)
      .set(auth(a.adminToken));
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`/api/medical-records/${created.body.id}/finalize`)
      .set(auth(a.adminToken));
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("MEDICAL_RECORD_ALREADY_FINALIZED");
  });

  it("concurrent finalize requests: exactly one wins, record never reverts to draft", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const [r1, r2] = await Promise.all([
      request(app).post(`/api/medical-records/${created.body.id}/finalize`).set(auth(a.adminToken)),
      request(app).post(`/api/medical-records/${created.body.id}/finalize`).set(auth(a.staffToken)),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([200, 409]);

    const record = await MedicalRecord.findById(created.body.id);
    expect(record?.status).toBe("finalized");
  });

  it("edit racing with finalize: the edit either applies before or is rejected after, never both applied and 200", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const [editResult, finalizeResult] = await Promise.all([
      request(app)
        .patch(`/api/medical-records/${created.body.id}`)
        .set(auth(a.adminToken))
        .send({ title: "Race title" }),
      request(app).post(`/api/medical-records/${created.body.id}/finalize`).set(auth(a.staffToken)),
    ]);

    // Whichever order they land in, the record must end up in a single
    // consistent state: finalized, and if the edit lost the race it must
    // have been rejected (409), never silently dropped with a 200.
    expect(finalizeResult.status).toBe(200);
    expect([200, 409]).toContain(editResult.status);

    const record = await MedicalRecord.findById(created.body.id);
    expect(record?.status).toBe("finalized");
    if (editResult.status === 200) {
      expect(record?.title).toBe("Race title");
    }
  });
});

describe("medical records - safe DTOs", () => {
  it("list DTO excludes the full clinical description", async () => {
    const a = await makeTenant("A");
    await createDraft(a);

    const response = await request(app)
      .get(`/api/medical-records?patientId=${a.patient._id}`)
      .set(auth(a.adminToken));
    expect(response.status).toBe(200);
    expect(response.body.data[0]).not.toHaveProperty("description");
    expect(response.body.data[0]).toMatchObject({
      recordType: "consultation",
      title: "Initial consultation",
      isAmendment: false,
    });
    expect(response.body.data[0].patient).toMatchObject({ name: a.patient.name });
  });

  it("detail DTO includes description but excludes forbidden internal fields", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const response = await request(app)
      .get(`/api/medical-records/${created.body.id}`)
      .set(auth(a.adminToken));
    expect(response.status).toBe(200);
    expect(response.body.description).toBeTruthy();
    for (const forbiddenKey of [
      "clinicId",
      "authorUserId",
      "__v",
      "passwordHash",
      "invoiceId",
      "paymentIntentId",
    ]) {
      expect(response.body).not.toHaveProperty(forbiddenKey);
    }
    expect(typeof response.body.patient.id).toBe("string");
    expect(typeof response.body.author.name).toBe("string");
  });
});

describe("medical records - amendments", () => {
  async function finalizeDraft(a: Tenant) {
    const created = await createDraft(a);
    await request(app).post(`/api/medical-records/${created.body.id}/finalize`).set(auth(a.adminToken));
    return created.body.id as string;
  }

  it("amending a finalized record creates a new record and leaves the original unchanged", async () => {
    const a = await makeTenant("A");
    const id = await finalizeDraft(a);

    const amendResponse = await request(app)
      .post(`/api/medical-records/${id}/amendments`)
      .set(auth(a.staffToken))
      .set("Idempotency-Key", "amend-key-1")
      .send({
        title: "Correction",
        description: "The correct tooth was upper right, not upper left.",
        amendmentReason: "Charting error identified on review",
      });
    expect(amendResponse.status).toBe(201);
    expect(amendResponse.body.isAmendment).toBe(true);
    expect(amendResponse.body.status).toBe("finalized");
    expect(amendResponse.body.amendedRecord.id).toBe(id);

    const original = await request(app).get(`/api/medical-records/${id}`).set(auth(a.adminToken));
    expect(original.body.title).toBe("Initial consultation");
    expect(original.body.description).toContain("mild sensitivity");
    expect(original.body.amendments).toHaveLength(1);
    expect(original.body.amendments[0].amendmentReason).toBe("Charting error identified on review");
  });

  it("cannot amend a draft record (409)", async () => {
    const a = await makeTenant("A");
    const created = await createDraft(a);

    const response = await request(app)
      .post(`/api/medical-records/${created.body.id}/amendments`)
      .set(auth(a.adminToken))
      .set("Idempotency-Key", "amend-key-2")
      .send({ title: "x", description: "y", amendmentReason: "z" });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("MEDICAL_RECORD_NOT_FINALIZED");
  });

  it("cannot amend a cross-clinic record (404)", async () => {
    const a = await makeTenant("A");
    const b = await makeTenant("B");
    const id = await finalizeDraft(a);

    const response = await request(app)
      .post(`/api/medical-records/${id}/amendments`)
      .set(auth(b.adminToken))
      .set("Idempotency-Key", "amend-key-3")
      .send({ title: "x", description: "y", amendmentReason: "z" });
    expect(response.status).toBe(404);
  });

  it("cannot amend an amendment", async () => {
    const a = await makeTenant("A");
    const id = await finalizeDraft(a);
    const amendment = await request(app)
      .post(`/api/medical-records/${id}/amendments`)
      .set(auth(a.adminToken))
      .set("Idempotency-Key", "amend-key-4")
      .send({ title: "Correction", description: "text", amendmentReason: "reason" });

    const secondAmendment = await request(app)
      .post(`/api/medical-records/${amendment.body.id}/amendments`)
      .set(auth(a.adminToken))
      .set("Idempotency-Key", "amend-key-5")
      .send({ title: "x", description: "y", amendmentReason: "z" });
    expect(secondAmendment.status).toBe(400);
    expect(secondAmendment.body.error.code).toBe("CANNOT_AMEND_AMENDMENT");
  });

  it("requires an Idempotency-Key header", async () => {
    const a = await makeTenant("A");
    const id = await finalizeDraft(a);

    const response = await request(app)
      .post(`/api/medical-records/${id}/amendments`)
      .set(auth(a.adminToken))
      .send({ title: "x", description: "y", amendmentReason: "z" });
    expect(response.status).toBe(400);
  });

  it("a duplicate amendment submission with the same idempotency key does not create two records", async () => {
    const a = await makeTenant("A");
    const id = await finalizeDraft(a);
    const body = { title: "Correction", description: "text", amendmentReason: "reason" };

    const [r1, r2] = await Promise.all([
      request(app)
        .post(`/api/medical-records/${id}/amendments`)
        .set(auth(a.adminToken))
        .set("Idempotency-Key", "same-key")
        .send(body),
      request(app)
        .post(`/api/medical-records/${id}/amendments`)
        .set(auth(a.staffToken))
        .set("Idempotency-Key", "same-key")
        .send(body),
    ]);

    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(r1.body.id).toBe(r2.body.id);

    const amendmentCount = await MedicalRecord.countDocuments({ amendedRecordId: new Types.ObjectId(id) });
    expect(amendmentCount).toBe(1);
  });

  it("requires amendmentReason on the amendment body", async () => {
    const a = await makeTenant("A");
    const id = await finalizeDraft(a);

    const response = await request(app)
      .post(`/api/medical-records/${id}/amendments`)
      .set(auth(a.adminToken))
      .set("Idempotency-Key", "amend-key-6")
      .send({ title: "x", description: "y" });
    expect(response.status).toBe(400);
  });
});

async function createDraftableTenant() {
  return makeTenant(`T${new Types.ObjectId().toString()}`);
}
