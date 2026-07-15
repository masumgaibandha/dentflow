import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dentists",
};

export default function DentistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
