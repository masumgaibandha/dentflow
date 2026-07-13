import { AdminOnly } from "@/components/layout/AdminOnly";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ItemsProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <AdminOnly>{children}</AdminOnly>
    </DashboardShell>
  );
}
