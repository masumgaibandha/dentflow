import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="bg-primary px-6 py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-white">
          Ready to bring your clinic online?
        </h2>
        <p className="max-w-xl text-blue-100">
          Register your clinic in minutes, or reach out if you have questions first.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className={buttonVariants({ variant: "secondary", size: "lg", className: "bg-white text-primary hover:bg-blue-50" })}
          >
            Register your clinic
          </Link>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/60 text-white hover:bg-white/10" })}
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
