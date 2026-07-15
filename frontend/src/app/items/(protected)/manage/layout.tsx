import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services Management",
};

export default function ManageServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
