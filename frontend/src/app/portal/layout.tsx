import type { Metadata } from "next";
import { PortalShell } from "@/components/layout/PortalShell";

export const metadata: Metadata = {
  // Object form so "%s | DentFlow" keeps propagating to portal/appointments,
  // portal/invoices, portal/medical-records - a bare string here would reset
  // the template for all of them.
  title: {
    default: "Patient Portal",
    template: "%s | DentFlow",
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
