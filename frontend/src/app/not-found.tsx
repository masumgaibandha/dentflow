import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/Button";

// Standalone rather than wrapped in PublicLayout - a not-found page should
// render reliably with no dependency on auth-aware nav state, and this is
// the one page in the app that genuinely wants to be minimal.
export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <Logo />
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wide text-accent uppercase">Error 404</p>
            <h1 className="text-balance mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Page not found
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist, may have moved, or the link may
              be out of date.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
                Return Home
              </Link>
              <Link href="/items" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Browse Services
              </Link>
            </div>
          </div>

          <div className="relative order-first aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-lg lg:order-last">
            <Image
              src="/assets/hero_banner_1.png"
              alt="A dentist and patient in a modern dental clinic"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-right"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
