import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
};

export default function StaffUsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
