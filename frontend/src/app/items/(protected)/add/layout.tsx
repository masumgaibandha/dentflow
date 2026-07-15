import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Service",
};

export default function AddServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
