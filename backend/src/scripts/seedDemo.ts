import bcrypt from "bcrypt";
import type { Types } from "mongoose";
import { Clinic, type ClinicDocument, type WeeklyHours } from "../models/Clinic";
import { Patient, type PatientDocument } from "../models/Patient";
import { Treatment } from "../models/Treatment";
import { User } from "../models/User";

// Matches the bcrypt configuration used everywhere else credentials are
// hashed (auth.service.ts, patient.service.ts) - not a special demo-only
// value.
const SALT_ROUNDS = 12;

export const DEMO_CLINIC_SLUG = "dentflow-demo";
export const DEMO_CLINIC_NAME = "DentFlow Dental Center";

export const DEMO_ADMIN_EMAIL = "admin@dentflow.demo";
export const DEMO_ADMIN_PASSWORD = "DemoAdmin123!";
export const DEMO_STAFF_EMAIL = "staff@dentflow.demo";
export const DEMO_STAFF_PASSWORD = "DemoStaff123!";
export const DEMO_PATIENT_EMAIL = "patient@dentflow.demo";
export const DEMO_PATIENT_PASSWORD = "DemoPatient123!";

export interface SeedLogEntry {
  entity: string;
  action: "created" | "updated";
}

export interface SeedDemoResult {
  clinicId: string;
  log: SeedLogEntry[];
}

// Raised when a seeded email already belongs to a different clinic - the
// script refuses to touch it rather than silently repointing someone else's
// account (see DentflowSeedConflictError usages below).
export class DentflowSeedConflictError extends Error {}

const DEMO_WEEKLY_HOURS: WeeklyHours = {
  monday: { isClosed: false, openTime: "09:00", closeTime: "17:00" },
  tuesday: { isClosed: false, openTime: "09:00", closeTime: "17:00" },
  wednesday: { isClosed: false, openTime: "09:00", closeTime: "17:00" },
  thursday: { isClosed: false, openTime: "09:00", closeTime: "17:00" },
  friday: { isClosed: false, openTime: "09:00", closeTime: "17:00" },
  saturday: { isClosed: false, openTime: "09:00", closeTime: "13:00" },
  sunday: { isClosed: true },
};

interface DemoTreatmentSeed {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  durationMinutes: number;
  category: "Preventive" | "Restorative" | "Cosmetic" | "Orthodontic" | "Surgical" | "Pediatric";
  imageUrl: string;
}

// Prices/durations are plausible, independent estimates - not copied from any
// real clinic's price list. Descriptions are specific to each treatment, not
// interchangeable filler text.
const DEMO_TREATMENTS: DemoTreatmentSeed[] = [
  {
    title: "Dental Consultation",
    shortDescription: "A full oral exam and personalized treatment plan.",
    fullDescription:
      "A comprehensive first visit covering a full oral examination, review of your dental history, and a personalized treatment plan. We'll discuss any concerns, take a look at your overall oral health, and outline next steps before any work begins.",
    price: 65,
    durationMinutes: 30,
    category: "Preventive",
    imageUrl: "/services/dental-consultation.svg",
  },
  {
    title: "Routine Dental Cleaning",
    shortDescription: "Professional cleaning to remove plaque and tartar buildup.",
    fullDescription:
      "A thorough professional cleaning that removes plaque and tartar buildup from above and below the gumline, followed by polishing. Recommended twice a year to prevent cavities and gum disease and keep your smile healthy between visits.",
    price: 95,
    durationMinutes: 45,
    category: "Preventive",
    imageUrl: "/services/dental-cleaning.svg",
  },
  {
    title: "Teeth Whitening",
    shortDescription: "In-office whitening treatment for a brighter smile.",
    fullDescription:
      "A professional-grade in-office whitening treatment that lifts years of staining from coffee, tea, and everyday wear. Results are visible immediately after a single session, with a noticeably brighter, more even smile.",
    price: 250,
    durationMinutes: 60,
    category: "Cosmetic",
    imageUrl: "/services/teeth-whitening.svg",
  },
  {
    title: "Composite Filling",
    shortDescription: "Tooth-colored filling to repair a cavity.",
    fullDescription:
      "A tooth-colored composite resin filling used to repair a cavity or minor fracture. The material is matched to your natural tooth shade and bonded directly, restoring strength and appearance without a visible metal filling.",
    price: 180,
    durationMinutes: 45,
    category: "Restorative",
    imageUrl: "/services/composite-filling.svg",
  },
  {
    title: "Root Canal Treatment",
    shortDescription: "Removes infected pulp to save a damaged tooth.",
    fullDescription:
      "A procedure that removes infected or inflamed pulp from inside the tooth, cleans and disinfects the root canal, and seals it to prevent further infection - relieving pain and saving a tooth that would otherwise need extraction.",
    price: 850,
    durationMinutes: 90,
    category: "Restorative",
    imageUrl: "/services/root-canal.svg",
  },
  {
    title: "Tooth Extraction",
    shortDescription: "Safe removal of a damaged or problematic tooth.",
    fullDescription:
      "Safe, comfortable removal of a tooth that's too damaged, decayed, or crowded to save. Includes local anesthesia and clear aftercare instructions to support fast, uncomplicated healing.",
    price: 220,
    durationMinutes: 30,
    category: "Surgical",
    imageUrl: "/services/tooth-extraction.svg",
  },
  {
    title: "Dental Crown",
    shortDescription: "Custom cap that restores a damaged tooth's shape and strength.",
    fullDescription:
      "A custom-fitted cap placed over a damaged or heavily restored tooth to restore its shape, size, and strength. Crowns protect a weakened tooth from further damage while blending naturally with your smile.",
    price: 1100,
    durationMinutes: 60,
    category: "Restorative",
    imageUrl: "/services/dental-crown.svg",
  },
  {
    title: "Dental Bridge",
    shortDescription: "Fixed replacement for one or more missing teeth.",
    fullDescription:
      "A fixed prosthetic that replaces one or more missing teeth by anchoring to the adjacent teeth. Bridges restore your bite and prevent neighboring teeth from shifting into the gap left behind.",
    price: 1800,
    durationMinutes: 90,
    category: "Restorative",
    imageUrl: "/services/dental-bridge.svg",
  },
  {
    title: "Dental Implant Consultation",
    shortDescription: "Evaluation to determine if implants are right for you.",
    fullDescription:
      "A dedicated consultation to evaluate whether a dental implant is the right option for replacing a missing tooth, including a review of bone health and a walkthrough of the implant process, timeline, and expected outcome.",
    price: 150,
    durationMinutes: 45,
    category: "Surgical",
    imageUrl: "/services/dental-implant-consultation.svg",
  },
  {
    title: "Orthodontic Consultation",
    shortDescription: "Assessment of alignment and bite for braces or aligners.",
    fullDescription:
      "An assessment of tooth alignment and bite to determine candidacy for braces or clear aligners, including a discussion of treatment options, estimated timeline, and what to expect before committing to a plan.",
    price: 120,
    durationMinutes: 45,
    category: "Orthodontic",
    imageUrl: "/services/orthodontic-consultation.svg",
  },
];

async function upsertClinic(): Promise<{ clinic: ClinicDocument; entry: SeedLogEntry }> {
  const clinicData = {
    name: DEMO_CLINIC_NAME,
    address: "482 Maple Street, Springfield, IL 62704",
    phone: "+1 (217) 555-0142",
    email: "hello@dentflow-demo.example",
    timezone: "America/Chicago",
    weeklyHours: DEMO_WEEKLY_HOURS,
  };

  const existing = await Clinic.findOne({ slug: DEMO_CLINIC_SLUG });
  if (existing) {
    Object.assign(existing, clinicData);
    await existing.save();
    return { clinic: existing, entry: { entity: `clinic:${DEMO_CLINIC_SLUG}`, action: "updated" } };
  }

  const created = await Clinic.create({ slug: DEMO_CLINIC_SLUG, invoiceSequence: 0, ...clinicData });
  return { clinic: created, entry: { entity: `clinic:${DEMO_CLINIC_SLUG}`, action: "created" } };
}

async function upsertDemoPatient(clinicId: string): Promise<{ patient: PatientDocument; entry: SeedLogEntry }> {
  const patientData = {
    name: "Alex Morgan",
    email: DEMO_PATIENT_EMAIL,
    phone: "+1 (217) 555-0199",
    dateOfBirth: new Date("1990-04-12T00:00:00.000Z"),
  };

  const existing = await Patient.findOne({ clinicId, email: DEMO_PATIENT_EMAIL });
  if (existing) {
    Object.assign(existing, patientData);
    await existing.save();
    return { patient: existing, entry: { entity: "patient:demo", action: "updated" } };
  }

  const created = await Patient.create({ clinicId, ...patientData });
  return { patient: created, entry: { entity: "patient:demo", action: "created" } };
}

// Upserts a demo login by email, scoped to the demo clinic. Refuses to touch
// an existing account with the same email that belongs to a different
// clinic - that's someone else's real account, not a stale demo record.
async function upsertDemoUser(params: {
  clinicId: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "patient";
  password: string;
  patientId?: Types.ObjectId;
}): Promise<SeedLogEntry> {
  const existing = await User.findOne({ email: params.email });

  if (existing && existing.clinicId.toString() !== params.clinicId) {
    throw new DentflowSeedConflictError(
      `Refusing to seed demo user "${params.email}": an account with this email already exists ` +
        `and belongs to a different clinic (clinicId ${existing.clinicId.toString()}). This email is ` +
        `not available for demo seeding until that conflict is resolved.`,
    );
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);

  if (existing) {
    existing.name = params.name;
    existing.role = params.role;
    existing.isActive = true;
    existing.passwordHash = passwordHash;
    if (params.patientId) {
      existing.patientId = params.patientId;
    }
    await existing.save();
    return { entity: `user:${params.email}`, action: "updated" };
  }

  await User.create({
    clinicId: params.clinicId,
    name: params.name,
    email: params.email,
    passwordHash,
    role: params.role,
    isActive: true,
    patientId: params.patientId,
  });
  return { entity: `user:${params.email}`, action: "created" };
}

async function upsertDemoTreatments(clinicId: string): Promise<SeedLogEntry[]> {
  const entries: SeedLogEntry[] = [];

  for (const treatment of DEMO_TREATMENTS) {
    const existing = await Treatment.findOne({ clinicId, title: treatment.title });
    if (existing) {
      Object.assign(existing, treatment, { isActive: true });
      await existing.save();
      entries.push({ entity: `treatment:${treatment.title}`, action: "updated" });
      continue;
    }

    await Treatment.create({ clinicId, isActive: true, ...treatment });
    entries.push({ entity: `treatment:${treatment.title}`, action: "created" });
  }

  return entries;
}

// The single reusable entry point - no process.exit, no top-level DB
// connect/disconnect, so it can run equally against a real MongoDB
// connection (see runSeedDemo.ts) or an in-memory mongodb-memory-server
// instance in tests. Safe to call repeatedly: every write below is an
// upsert keyed on a stable identity (clinic slug, user email, patient
// clinicId+email, treatment clinicId+title), never a blind create.
export async function seedDemo(): Promise<SeedDemoResult> {
  const log: SeedLogEntry[] = [];

  const { clinic, entry: clinicEntry } = await upsertClinic();
  log.push(clinicEntry);
  const clinicId = clinic._id.toString();

  const { patient, entry: patientEntry } = await upsertDemoPatient(clinicId);
  log.push(patientEntry);

  log.push(
    await upsertDemoUser({
      clinicId,
      email: DEMO_ADMIN_EMAIL,
      name: "Demo Admin",
      role: "admin",
      password: DEMO_ADMIN_PASSWORD,
    }),
  );
  log.push(
    await upsertDemoUser({
      clinicId,
      email: DEMO_STAFF_EMAIL,
      name: "Demo Staff",
      role: "staff",
      password: DEMO_STAFF_PASSWORD,
    }),
  );
  log.push(
    await upsertDemoUser({
      clinicId,
      email: DEMO_PATIENT_EMAIL,
      name: patient.name,
      role: "patient",
      password: DEMO_PATIENT_PASSWORD,
      patientId: patient._id,
    }),
  );

  log.push(...(await upsertDemoTreatments(clinicId)));

  return { clinicId, log };
}
