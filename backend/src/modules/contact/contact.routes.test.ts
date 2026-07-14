import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { ContactMessage } from "../../models/ContactMessage";

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
    name: "Jordan Rivera",
    email: "jordan@example.com",
    subject: "Question about pricing",
    message: "Hi, I'd like to know more about DentFlow for my clinic.",
    ...overrides,
  };
}

describe("contact - public submission", () => {
  it("requires no authentication and stores the message", async () => {
    const response = await request(app).post("/api/contact").send(validBody());
    expect(response.status).toBe(201);
    expect(response.body.id).toBeTruthy();

    const stored = await ContactMessage.findById(response.body.id);
    expect(stored).toBeTruthy();
    expect(stored?.name).toBe("Jordan Rivera");
    expect(stored?.email).toBe("jordan@example.com");
    expect(stored?.subject).toBe("Question about pricing");
  });

  it("rejects a missing required field", async () => {
    for (const field of ["name", "email", "subject", "message"]) {
      const body = validBody();
      delete (body as Record<string, unknown>)[field];
      const response = await request(app).post("/api/contact").send(body);
      expect(response.status).toBe(400);
    }
  });

  it("rejects an invalid email", async () => {
    const response = await request(app).post("/api/contact").send(validBody({ email: "not-an-email" }));
    expect(response.status).toBe(400);
  });

  it("rejects oversized fields", async () => {
    const longName = await request(app)
      .post("/api/contact")
      .send(validBody({ name: "x".repeat(201) }));
    expect(longName.status).toBe(400);

    const longMessage = await request(app)
      .post("/api/contact")
      .send(validBody({ message: "x".repeat(5_001) }));
    expect(longMessage.status).toBe(400);
  });

  it("rejects unknown fields (strict schema)", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send(validBody({ clinicId: "6a55a44be1db1a393b44ba4f" }));
    expect(response.status).toBe(400);
  });

  it("trims and lowercases the email before storing", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send(validBody({ email: "  Jordan@Example.com  " }));
    expect(response.status).toBe(201);

    const stored = await ContactMessage.findById(response.body.id);
    expect(stored?.email).toBe("jordan@example.com");
  });
});
