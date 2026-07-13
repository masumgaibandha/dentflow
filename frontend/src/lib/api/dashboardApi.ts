import { apiFetch } from "@/lib/api/client";

export interface DashboardChartDay {
  date: string;
  totalCents: number;
}

export interface DashboardSummary {
  timezone: string;
  totals: {
    patients: number;
    dentists: number;
    activeTreatments: number;
  };
  appointments: {
    today: number;
    upcoming: number;
  };
  invoices: {
    unpaidCount: number;
    outstandingCents: number;
    paidRevenueThisMonthCents: number;
  };
  chart: {
    metric: "paidRevenueCents";
    label: string;
    days: DashboardChartDay[];
  };
}

export function getDashboardSummary(token: string): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/api/dashboard/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
