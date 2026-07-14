import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TREATMENT_IMAGE_FALLBACK_SRC, TreatmentImage } from "@/components/treatments/TreatmentImage";

describe("TreatmentImage", () => {
  it("renders the provided image unchanged when it loads successfully", () => {
    render(<TreatmentImage src="/services/dental-crown.svg" alt="Dental Crown" />);
    const img = screen.getByAltText("Dental Crown");
    expect(img).toHaveAttribute("src", "/services/dental-crown.svg");
  });

  it("renders the fallback when src is missing", () => {
    render(<TreatmentImage src={undefined} alt="Dental Crown" />);
    expect(screen.getByAltText("Dental Crown")).toHaveAttribute("src", TREATMENT_IMAGE_FALLBACK_SRC);
  });

  it("renders the fallback when src is an empty string", () => {
    render(<TreatmentImage src="" alt="Dental Crown" />);
    expect(screen.getByAltText("Dental Crown")).toHaveAttribute("src", TREATMENT_IMAGE_FALLBACK_SRC);
  });

  it("switches to the fallback when the image fails to load", () => {
    render(<TreatmentImage src="https://example.com/broken.jpg" alt="Dental Crown" />);
    const img = screen.getByAltText("Dental Crown");
    expect(img).toHaveAttribute("src", "https://example.com/broken.jpg");

    fireEvent.error(img);

    expect(screen.getByAltText("Dental Crown")).toHaveAttribute("src", TREATMENT_IMAGE_FALLBACK_SRC);
  });

  it("does not enter an infinite error loop if the fallback itself errors", () => {
    render(<TreatmentImage src="https://example.com/broken.jpg" alt="Dental Crown" />);
    const img = screen.getByAltText("Dental Crown");

    fireEvent.error(img);
    expect(img).toHaveAttribute("src", TREATMENT_IMAGE_FALLBACK_SRC);

    // Firing error again (as if the fallback asset itself failed) must not
    // throw, loop, or change the resolved src any further.
    expect(() => fireEvent.error(img)).not.toThrow();
    expect(img).toHaveAttribute("src", TREATMENT_IMAGE_FALLBACK_SRC);
  });

  it("preserves meaningful alt text even when showing the fallback", () => {
    render(<TreatmentImage src={undefined} alt="Teeth Whitening" />);
    expect(screen.getByAltText("Teeth Whitening")).toBeInTheDocument();
  });
});
