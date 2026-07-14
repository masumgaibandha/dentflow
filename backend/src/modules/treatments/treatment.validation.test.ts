import { describe, expect, it } from "vitest";
import { treatmentInputSchema } from "./treatment.validation";

const baseInput = {
  title: "Dental Cleaning",
  shortDescription: "A routine cleaning and polish.",
  fullDescription: "A thorough professional cleaning to remove plaque and tartar buildup.",
  price: 80,
  durationMinutes: 30,
  category: "Preventive" as const,
};

describe("treatmentInputSchema - imageUrl", () => {
  it("accepts a treatment with imageUrl omitted entirely", () => {
    const result = treatmentInputSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("normalizes an empty string to undefined", () => {
    const result = treatmentInputSchema.safeParse({ ...baseInput, imageUrl: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("normalizes whitespace-only input to undefined", () => {
    const result = treatmentInputSchema.safeParse({ ...baseInput, imageUrl: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("rejects a malformed non-empty image URL", () => {
    const result = treatmentInputSchema.safeParse({ ...baseInput, imageUrl: "not a url" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/valid image URL or local path/);
    }
  });

  it("accepts a valid local image path", () => {
    const result = treatmentInputSchema.safeParse({
      ...baseInput,
      imageUrl: "/services/dental-cleaning.svg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe("/services/dental-cleaning.svg");
    }
  });

  it("rejects a protocol-relative path (not a real local path)", () => {
    const result = treatmentInputSchema.safeParse({ ...baseInput, imageUrl: "//evil.example/x" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid absolute HTTPS URL", () => {
    const result = treatmentInputSchema.safeParse({
      ...baseInput,
      imageUrl: "https://example.com/dental-cleaning.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe("https://example.com/dental-cleaning.jpg");
    }
  });

  it("rejects unrelated required fields being weakened - title is still required", () => {
    const result = treatmentInputSchema.safeParse({ ...baseInput, title: "" });
    expect(result.success).toBe(false);
  });
});
