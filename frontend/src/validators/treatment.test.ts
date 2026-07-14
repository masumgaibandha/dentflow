import { describe, expect, it } from "vitest";
import { treatmentFormSchema } from "@/validators/treatment";

const baseInput = {
  title: "Dental Cleaning",
  shortDescription: "A routine cleaning and polish.",
  fullDescription: "A thorough professional cleaning to remove plaque and tartar buildup.",
  price: 80,
  durationMinutes: 30,
  category: "Preventive" as const,
};

describe("treatmentFormSchema - imageUrl", () => {
  it("accepts a treatment with imageUrl omitted entirely", () => {
    const result = treatmentFormSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("normalizes an empty string (default form value) to undefined", () => {
    const result = treatmentFormSchema.safeParse({ ...baseInput, imageUrl: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("normalizes whitespace-only input to undefined", () => {
    const result = treatmentFormSchema.safeParse({ ...baseInput, imageUrl: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined();
    }
  });

  it("rejects a malformed non-empty image URL", () => {
    const result = treatmentFormSchema.safeParse({ ...baseInput, imageUrl: "not a url" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/valid image URL or local path/);
    }
  });

  it("accepts a valid local image path", () => {
    const result = treatmentFormSchema.safeParse({
      ...baseInput,
      imageUrl: "/services/dental-cleaning.svg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe("/services/dental-cleaning.svg");
    }
  });

  it("accepts a valid absolute HTTPS URL", () => {
    const result = treatmentFormSchema.safeParse({
      ...baseInput,
      imageUrl: "https://example.com/dental-cleaning.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe("https://example.com/dental-cleaning.jpg");
    }
  });

  it("does not weaken unrelated required fields - short description still required", () => {
    const result = treatmentFormSchema.safeParse({ ...baseInput, shortDescription: "short" });
    expect(result.success).toBe(false);
  });
});
