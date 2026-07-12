import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ItemsProtectedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
