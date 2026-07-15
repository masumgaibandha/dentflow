import type { Metadata } from "next";
import { AdminOnly } from "@/components/layout/AdminOnly";

export const metadata: Metadata = {
  // Object form so "%s | DentFlow" keeps propagating to settings/users - a
  // bare string here would reset the template for it.
  title: {
    default: "Settings",
    template: "%s | DentFlow",
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
