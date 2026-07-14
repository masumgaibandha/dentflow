import { Footer } from "@/components/layout/Footer";
import { PublicTopBar } from "@/components/layout/PublicTopBar";

// Shared wrapper for every unauthenticated-facing page (/, /items,
// /items/[id], /about, /contact, /login, /register). Never used for
// (dashboard) or portal routes - those keep their own DashboardShell/
// PortalShell, which is a different navigation surface entirely.
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicTopBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
