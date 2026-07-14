import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import type { DashboardChartDay } from "@/lib/api/dashboardApi";

// Shaped exactly like the real GET /api/dashboard/summary response's
// chart.days - never invented/fabricated fields.
const REAL_SHAPED_DAYS: DashboardChartDay[] = [
  { date: "2026-01-01", totalCents: 0 },
  { date: "2026-01-02", totalCents: 9500 },
  { date: "2026-01-03", totalCents: 25000 },
  { date: "2026-01-04", totalCents: 0 },
  { date: "2026-01-05", totalCents: 18000 },
];

describe("RevenueChart", () => {
  it("renders using the real provided data, not fabricated frontend data", () => {
    render(<RevenueChart label="Last 5 days" days={REAL_SHAPED_DAYS} />);

    // Total = 95.00 + 250.00 + 180.00 = 525.00
    expect(screen.getByText(/Total \$525\.00/)).toBeInTheDocument();

    const chart = screen.getByRole("img", { name: /Last 5 days/ });
    expect(chart).toHaveAccessibleName(expect.stringContaining("$525.00"));
  });

  it("renders a controlled empty state when there is no revenue data", () => {
    const zeroedDays = REAL_SHAPED_DAYS.map((day) => ({ ...day, totalCents: 0 }));
    render(<RevenueChart label="Last 5 days" days={zeroedDays} />);

    expect(screen.getByText("No paid revenue in this period yet.")).toBeInTheDocument();
    // The chart itself must not render at all in the empty state - not an
    // empty/zeroed chart.
    expect(screen.queryByRole("img", { name: /Last 5 days/ })).not.toBeInTheDocument();
  });

  it("wraps the chart in a full-width responsive container", () => {
    render(<RevenueChart label="Last 5 days" days={REAL_SHAPED_DAYS} />);
    const chart = screen.getByRole("img", { name: /Last 5 days/ });
    expect(chart.className).toContain("w-full");
  });

  it("includes a screen-reader-accessible data table mirroring the chart", () => {
    render(<RevenueChart label="Last 5 days" days={REAL_SHAPED_DAYS} />);
    expect(screen.getByText("2026-01-02")).toBeInTheDocument();
    expect(screen.getByText("$95.00")).toBeInTheDocument();
  });
});
