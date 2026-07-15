import { describe, expect, it } from "vitest";
import { PASSWORD_REQUIREMENTS, registerFormSchema } from "@/validators/auth";

const baseInput = {
  clinicName: "Riverside Dental",
  adminName: "Jordan Rivera",
  email: "jordan@example.com",
  password: "Str0ng!Pass",
  confirmPassword: "Str0ng!Pass",
};

describe("registerFormSchema - password strength", () => {
  it("accepts a valid strong password", () => {
    const result = registerFormSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerFormSchema.safeParse({
      ...baseInput,
      password: "Ab1!ab",
      confirmPassword: "Ab1!ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    const result = registerFormSchema.safeParse({
      ...baseInput,
      password: "str0ng!pass",
      confirmPassword: "str0ng!pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a lowercase letter", () => {
    const result = registerFormSchema.safeParse({
      ...baseInput,
      password: "STR0NG!PASS",
      confirmPassword: "STR0NG!PASS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a number", () => {
    const result = registerFormSchema.safeParse({
      ...baseInput,
      password: "Strong!Pass",
      confirmPassword: "Strong!Pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a special character", () => {
    const result = registerFormSchema.safeParse({
      ...baseInput,
      password: "Str0ngPass",
      confirmPassword: "Str0ngPass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 64 characters", () => {
    const longPassword = `Aa1!${"a".repeat(62)}`;
    const result = registerFormSchema.safeParse({
      ...baseInput,
      password: longPassword,
      confirmPassword: longPassword,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password with a leading or trailing space", () => {
    const leading = registerFormSchema.safeParse({
      ...baseInput,
      password: " Str0ng!Pass",
      confirmPassword: " Str0ng!Pass",
    });
    expect(leading.success).toBe(false);

    const trailing = registerFormSchema.safeParse({
      ...baseInput,
      password: "Str0ng!Pass ",
      confirmPassword: "Str0ng!Pass ",
    });
    expect(trailing.success).toBe(false);
  });

  it("rejects mismatched password and confirmPassword, attributing the error to confirmPassword", () => {
    const result = registerFormSchema.safeParse({
      ...baseInput,
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "confirmPassword");
      expect(issue?.message).toBe("Passwords do not match");
    }
  });
});

describe("PASSWORD_REQUIREMENTS - live checklist source of truth", () => {
  it("marks every requirement met for a valid strong password", () => {
    for (const requirement of PASSWORD_REQUIREMENTS) {
      expect(requirement.test("Str0ng!Pass")).toBe(true);
    }
  });

  it("marks only the unmet requirements as false for a weak password", () => {
    const results = Object.fromEntries(
      PASSWORD_REQUIREMENTS.map((r) => [r.id, r.test("weakpass")]),
    );
    expect(results).toEqual({
      length: true,
      uppercase: false,
      lowercase: true,
      number: false,
      special: false,
    });
  });
});
