import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { Clinic } from "../models/Clinic";
import { Patient } from "../models/Patient";
import { Treatment } from "../models/Treatment";
import { User } from "../models/User";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_CLINIC_SLUG,
  DEMO_PATIENT_EMAIL,
  DEMO_PATIENT_PASSWORD,
  DEMO_STAFF_EMAIL,
  DEMO_STAFF_PASSWORD,
  DentflowSeedConflictError,
  seedDemo,
} from "./seedDemo";

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

describe("seedDemo - idempotency", () => {
  it("runs without error and is safe to run a second time", async () => {
    await expect(seedDemo()).resolves.toBeTruthy();
    await expect(seedDemo()).resolves.toBeTruthy();
  });

  it("creates exactly one demo clinic even after a second run", async () => {
    await seedDemo();
    await seedDemo();

    const count = await Clinic.countDocuments({ slug: DEMO_CLINIC_SLUG });
    expect(count).toBe(1);
  });

  it("creates exactly one user per demo email even after a second run", async () => {
    await seedDemo();
    await seedDemo();

    for (const email of [DEMO_ADMIN_EMAIL, DEMO_STAFF_EMAIL, DEMO_PATIENT_EMAIL]) {
      const count = await User.countDocuments({ email });
      expect(count).toBe(1);
    }
  });

  it("creates exactly one demo patient and keeps the same patient link across runs", async () => {
    const first = await seedDemo();
    const clinic = await Clinic.findOne({ slug: DEMO_CLINIC_SLUG });
    const patientCountAfterFirst = await Patient.countDocuments({
      clinicId: clinic!._id,
      email: DEMO_PATIENT_EMAIL,
    });
    expect(patientCountAfterFirst).toBe(1);

    const patientUserAfterFirst = await User.findOne({ email: DEMO_PATIENT_EMAIL });
    const patientIdAfterFirst = patientUserAfterFirst!.patientId!.toString();

    await seedDemo();

    const patientCountAfterSecond = await Patient.countDocuments({
      clinicId: clinic!._id,
      email: DEMO_PATIENT_EMAIL,
    });
    expect(patientCountAfterSecond).toBe(1);

    const patientUserAfterSecond = await User.findOne({ email: DEMO_PATIENT_EMAIL });
    expect(patientUserAfterSecond!.patientId!.toString()).toBe(patientIdAfterFirst);
    expect(first.clinicId).toBe(clinic!._id.toString());
  });

  it("creates exactly ten demo treatments even after a second run", async () => {
    await seedDemo();
    await seedDemo();

    const clinic = await Clinic.findOne({ slug: DEMO_CLINIC_SLUG });
    const count = await Treatment.countDocuments({ clinicId: clinic!._id });
    expect(count).toBe(10);
  });
});

describe("seedDemo - accounts authenticate through the normal login endpoint", () => {
  it("logs in as admin with the correct role", async () => {
    await seedDemo();
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD });
    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("admin");
    expect(response.body).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(response.body)).not.toContain(DEMO_ADMIN_PASSWORD);
  });

  it("logs in as staff with the correct role", async () => {
    await seedDemo();
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: DEMO_STAFF_EMAIL, password: DEMO_STAFF_PASSWORD });
    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("staff");
  });

  it("logs in as patient with the correct role and a linked patient record", async () => {
    await seedDemo();
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: DEMO_PATIENT_EMAIL, password: DEMO_PATIENT_PASSWORD });
    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("patient");

    // Behavioral confirmation of the patientId link: the portal "me" endpoint
    // only resolves successfully when req.user.patientId points at a real,
    // same-clinic Patient document.
    const me = await request(app)
      .get("/api/portal/me")
      .set("Authorization", `Bearer ${response.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.name).toBe("Alex Morgan");
  });

  it("rejects the wrong password for a demo account", async () => {
    await seedDemo();
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: DEMO_ADMIN_EMAIL, password: "wrong-password" });
    expect(response.status).toBe(401);
  });
});

describe("seedDemo - services are active, tenant-scoped, and isolated", () => {
  it("seeds exactly ten active treatments scoped to the demo clinic", async () => {
    await seedDemo();
    const clinic = await Clinic.findOne({ slug: DEMO_CLINIC_SLUG });
    const treatments = await Treatment.find({ clinicId: clinic!._id });
    expect(treatments).toHaveLength(10);
    for (const treatment of treatments) {
      expect(treatment.isActive).toBe(true);
      expect(treatment.clinicId.toString()).toBe(clinic!._id.toString());
    }
  });

  it("does not create or affect treatments for an unrelated clinic", async () => {
    const otherClinic = await Clinic.create({
      name: "Unrelated Clinic",
      slug: "unrelated-clinic",
      invoiceSequence: 0,
    });

    await seedDemo();

    const otherClinicTreatments = await Treatment.countDocuments({ clinicId: otherClinic._id });
    expect(otherClinicTreatments).toBe(0);
  });

  it("the public treatment API respects the requested clinic slug and excludes demo services from other clinics", async () => {
    const otherClinic = await Clinic.create({
      name: "Unrelated Clinic",
      slug: "unrelated-clinic",
      invoiceSequence: 0,
    });
    await Treatment.create({
      clinicId: otherClinic._id,
      imageUrl: "/services/other.svg",
      title: "Unrelated Treatment",
      shortDescription: "Not part of the demo clinic.",
      fullDescription: "This treatment belongs to a different clinic entirely.",
      price: 50,
      durationMinutes: 20,
      category: "Preventive",
      isActive: true,
    });

    await seedDemo();

    const demoResponse = await request(app).get(`/api/treatments?clinic=${DEMO_CLINIC_SLUG}`);
    expect(demoResponse.status).toBe(200);
    expect(demoResponse.body.data).toHaveLength(10);
    expect(demoResponse.body.data.some((t: { title: string }) => t.title === "Unrelated Treatment")).toBe(
      false,
    );

    const otherResponse = await request(app).get(`/api/treatments?clinic=unrelated-clinic`);
    expect(otherResponse.status).toBe(200);
    expect(otherResponse.body.data).toHaveLength(1);
    expect(otherResponse.body.data[0].title).toBe("Unrelated Treatment");
  });

  it("an admin from another clinic cannot list the demo clinic's treatments via the admin endpoint", async () => {
    await seedDemo();

    const otherClinic = await Clinic.create({
      name: "Unrelated Clinic",
      slug: "unrelated-clinic-2",
      invoiceSequence: 0,
    });
    await User.create({
      clinicId: otherClinic._id,
      name: "Other Admin",
      email: "otheradmin@example.com",
      passwordHash: await bcrypt.hash("SomePassword123!", 4),
      role: "admin",
      isActive: true,
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "otheradmin@example.com", password: "SomePassword123!" });
    expect(login.status).toBe(200);

    const adminList = await request(app)
      .get("/api/treatments/admin")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(adminList.status).toBe(200);
    expect(adminList.body.data).toHaveLength(0);
  });
});

describe("seedDemo - conflict detection", () => {
  it("refuses to overwrite an existing account with the same email belonging to a different clinic", async () => {
    const otherClinic = await Clinic.create({
      name: "Real Clinic",
      slug: "real-clinic",
      invoiceSequence: 0,
    });
    const originalHash = await bcrypt.hash("RealPassword123!", 4);
    await User.create({
      clinicId: otherClinic._id,
      name: "Real Admin",
      email: DEMO_ADMIN_EMAIL,
      passwordHash: originalHash,
      role: "admin",
      isActive: true,
    });

    await expect(seedDemo()).rejects.toThrow(DentflowSeedConflictError);

    const untouched = await User.findOne({ email: DEMO_ADMIN_EMAIL }).select("+passwordHash");
    expect(untouched!.clinicId.toString()).toBe(otherClinic._id.toString());
    expect(untouched!.passwordHash).toBe(originalHash);
    expect(untouched!.name).toBe("Real Admin");
  });

  it("does not create the demo clinic's treatments when the user conflict aborts the run partway through", async () => {
    // Deliberately conflicts on the *staff* email (seeded after the clinic
    // and admin) so the clinic itself does get created before the throw -
    // this documents the actual (partial) failure behavior rather than
    // pretending the whole run is transactional.
    const otherClinic = await Clinic.create({
      name: "Real Clinic",
      slug: "real-clinic-2",
      invoiceSequence: 0,
    });
    await User.create({
      clinicId: otherClinic._id,
      name: "Real Staff",
      email: DEMO_STAFF_EMAIL,
      passwordHash: await bcrypt.hash("RealPassword123!", 4),
      role: "staff",
      isActive: true,
    });

    await expect(seedDemo()).rejects.toThrow(DentflowSeedConflictError);

    const demoClinic = await Clinic.findOne({ slug: DEMO_CLINIC_SLUG });
    expect(demoClinic).toBeTruthy();
    const treatments = await Treatment.countDocuments({ clinicId: demoClinic!._id });
    expect(treatments).toBe(0);
  });
});

describe("seedDemo - multi-tenant isolation unaffected", () => {
  it("does not alter an unrelated clinic's own users", async () => {
    const otherClinic = await Clinic.create({
      name: "Unrelated Clinic",
      slug: "unrelated-clinic-3",
      invoiceSequence: 0,
    });
    const otherUser = await User.create({
      clinicId: otherClinic._id,
      name: "Someone Else",
      email: "someone@example.com",
      passwordHash: await bcrypt.hash("Password123!", 4),
      role: "admin",
      isActive: true,
    });

    await seedDemo();

    const stillThere = await User.findById(otherUser._id);
    expect(stillThere).toBeTruthy();
    expect(stillThere!.email).toBe("someone@example.com");
    expect(stillThere!.clinicId.toString()).toBe(otherClinic._id.toString());
  });

  it("does not touch an unrelated clinic document", async () => {
    const otherClinic = await Clinic.create({
      name: "Unrelated Clinic",
      slug: "unrelated-clinic-4",
      invoiceSequence: 0,
    });

    await seedDemo();

    const stillThere = await Clinic.findById(otherClinic._id);
    expect(stillThere).toBeTruthy();
    expect(stillThere!.name).toBe("Unrelated Clinic");
  });
});
