import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreatmentTable } from "@/components/treatments/TreatmentTable";
import type { Treatment } from "@/lib/api/treatmentsApi";

const treatments: Treatment[] = [
  {
    id: "64f0000000000000000000aa",
    clinicId: "64f0000000000000000000bb",
    imageUrl: "/services/dental-crown.svg",
    title: "Dental Crown",
    shortDescription: "Custom cap that restores a damaged tooth's shape and strength.",
    fullDescription: "A custom-fitted cap placed over a damaged or heavily restored tooth.",
    price: 1100,
    durationMinutes: 60,
    category: "Restorative",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "64f0000000000000000000cc",
    clinicId: "64f0000000000000000000bb",
    title: "Teeth Whitening",
    shortDescription: "A professional whitening treatment.",
    fullDescription: "Removes stains and brightens teeth using a professional-grade agent.",
    price: 250,
    durationMinutes: 45,
    category: "Cosmetic",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function getRow(title: string) {
  return screen.getByText(title).closest("tr")!;
}

describe("TreatmentTable actions", () => {
  it("renders a View action for every treatment", () => {
    render(
      <TreatmentTable treatments={treatments} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    for (const treatment of treatments) {
      expect(within(getRow(treatment.title)).getByRole("link", { name: "View" })).toBeInTheDocument();
    }
  });

  it("points View at the correct treatment ID", () => {
    render(
      <TreatmentTable treatments={treatments} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const link = within(getRow("Dental Crown")).getByRole("link", { name: "View" });
    expect(link).toHaveAttribute("href", "/items/64f0000000000000000000aa");
  });

  it("preserves clinic context on the View link when a clinicSlug is provided", () => {
    render(
      <TreatmentTable
        treatments={treatments}
        isLoading={false}
        clinicSlug="dentflow-demo"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const link = within(getRow("Teeth Whitening")).getByRole("link", { name: "View" });
    expect(link).toHaveAttribute(
      "href",
      "/items/64f0000000000000000000cc?clinic=dentflow-demo",
    );
  });

  it("omits the clinic query param when no clinicSlug is provided", () => {
    render(
      <TreatmentTable treatments={treatments} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const link = within(getRow("Teeth Whitening")).getByRole("link", { name: "View" });
    expect(link).toHaveAttribute("href", "/items/64f0000000000000000000cc");
  });

  it("still renders Edit and Delete for every treatment", () => {
    render(
      <TreatmentTable treatments={treatments} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    for (const treatment of treatments) {
      const row = within(getRow(treatment.title));
      expect(row.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(row.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    }
  });

  it("renders View, Edit, and Delete as siblings with no nested interactive controls", () => {
    const { container } = render(
      <TreatmentTable treatments={treatments} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    for (const anchor of Array.from(container.querySelectorAll("a"))) {
      expect(anchor.querySelector("button, a")).toBeNull();
    }
    for (const button of Array.from(container.querySelectorAll("button"))) {
      expect(button.closest("a")).toBeNull();
    }
  });
});
