import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TreatmentCard } from "@/components/treatments/TreatmentCard";
import type { Treatment } from "@/lib/api/treatmentsApi";

const treatment: Treatment = {
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
};

describe("TreatmentCard", () => {
  it("renders an explicit 'View Details' action", () => {
    render(<TreatmentCard treatment={treatment} />);
    expect(screen.getByRole("link", { name: "View Details" })).toBeInTheDocument();
  });

  it("points View Details at the correct treatment route", () => {
    render(<TreatmentCard treatment={treatment} />);
    const viewDetailsLink = screen.getByRole("link", { name: "View Details" });
    expect(viewDetailsLink).toHaveAttribute("href", `/items/${treatment.id}`);
  });

  it("includes the clinic slug in both links when provided", () => {
    render(<TreatmentCard treatment={treatment} clinicSlug="dentflow-demo" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", `/items/${treatment.id}?clinic=dentflow-demo`);
    }
  });

  it("renders as two sibling links, never one nested inside the other", () => {
    const { container } = render(<TreatmentCard treatment={treatment} />);
    // A nested <a> is invalid HTML and, more importantly here, would mean
    // getAllByRole("link") returns something other than exactly 2 flat,
    // independently-focusable links.
    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(2);
    expect(anchors[0].contains(anchors[1])).toBe(false);
    expect(anchors[1].contains(anchors[0])).toBe(false);
  });

  it("renders title, description, price, and duration", () => {
    render(<TreatmentCard treatment={treatment} />);
    expect(screen.getByRole("heading", { name: "Dental Crown" })).toBeInTheDocument();
    expect(screen.getByText(/Custom cap that restores/)).toBeInTheDocument();
    expect(screen.getByText("$1100.00")).toBeInTheDocument();
    expect(screen.getByText("60 min")).toBeInTheDocument();
  });
});
