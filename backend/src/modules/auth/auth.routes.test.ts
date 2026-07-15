import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { User } from "../../models/User";

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

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    clinicName: "Riverside Dental",
    adminName: "Jordan Rivera",
    email: "jordan@example.com",
    password: "Str0ng!Pass",
    ...overrides,
  };
}

describe("POST /api/auth/register - password strength", () => {
  it("succeeds and hashes a valid strong password", async () => {
    const response = await request(app).post("/api/auth/register").send(validBody());
    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();

    const stored = await User.findOne({ email: "jordan@example.com" }).select("+passwordHash");
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe("Str0ng!Pass");
  });

  it("rejects an invalid password with a 400 validation response and creates no account", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validBody({ password: "weakpass" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    const stored = await User.findOne({ email: "jordan@example.com" });
    expect(stored).toBeNull();
  });
});
