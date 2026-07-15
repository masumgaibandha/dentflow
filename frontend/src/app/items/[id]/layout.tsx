import type { Metadata } from "next";

// The service-detail page is a fully client-rendered component (uses
// useParams/useSearchParams to resolve the treatment + clinic client-side),
// so a real per-service dynamic title (e.g. "Teeth Whitening | DentFlow")
// would require restructuring it into a server component that fetches the
// treatment before render - a bigger architectural change than this
// metadata pass is meant to make. This static title is the safe interim
// state; see the final report for that limitation.
export const metadata: Metadata = {
  title: "Service Details",
};

export default function ItemDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
