import type { Metadata } from "next";

export const metadata: Metadata = {
  // Object form (not a bare string) so the "%s | DentFlow" template keeps
  // propagating to nested routes (items/[id], items/manage, items/add) -
  // a bare string here would reset the template for all of them.
  title: {
    default: "Services",
    template: "%s | DentFlow",
  },
  description: "Browse the dental services and treatments published by DentFlow clinics.",
};

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
