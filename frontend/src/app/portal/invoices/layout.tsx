import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function PortalInvoicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
