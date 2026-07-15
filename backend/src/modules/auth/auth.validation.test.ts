import { describe, expect, it } from "vitest";
import { registerSchema } from "./auth.validation";

const baseInput = {
  clinicName: "Riverside Dental",
  adminName: "Jordan Rivera",
  email: "jordan@example.com",
  password: "Str0ng!Pass",
};

describe("registerSchema - password strength", () => {
  it("accepts a valid strong password", () => {
    const result = registerSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...baseInput, password: "Ab1!ab" });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    const result = registerSchema.safeParse({ ...baseInput, password: "str0ng!pass" });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a lowercase letter", () => {
    const result = registerSchema.safeParse({ ...baseInput, password: "STR0NG!PASS" });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a number", () => {
    const result = registerSchema.safeParse({ ...baseInput, password: "Strong!Pass" });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a special character", () => {
    const result = registerSchema.safeParse({ ...baseInput, password: "Str0ngPass" });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 64 characters", () => {
    const longPassword = `Aa1!${"a".repeat(62)}`;
    const result = registerSchema.safeParse({ ...baseInput, password: longPassword });
    expect(result.success).toBe(false);
  });

  it("rejects a password with a leading or trailing space", () => {
    expect(registerSchema.safeParse({ ...baseInput, password: " Str0ng!Pass" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...baseInput, password: "Str0ng!Pass " }).success).toBe(false);
  });

  it("never trims the password value on success (change the value, break the hash)", () => {
    const result = registerSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.password).toBe("Str0ng!Pass");
    }
  });
});
