import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your Clinic",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
