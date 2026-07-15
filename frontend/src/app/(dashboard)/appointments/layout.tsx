import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
