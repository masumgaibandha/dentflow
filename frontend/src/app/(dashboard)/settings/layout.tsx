import { AdminOnly } from "@/components/layout/AdminOnly";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
