import Link from "next/link";
import { LogoOnDark } from "@/components/layout/Logo";

const CONTACT_EMAIL = "info@dentflow.com";
const GITHUB_URL = "https://github.com/masumgaibandha/dentflow";
const DEVELOPER_URL = "https://masumdev.com";

const linkClasses =
  "w-fit text-sm text-(--footer-muted) transition-colors duration-200 hover:text-(--footer-foreground) focus-visible:outline-none focus-visible:text-(--footer-foreground) focus-visible:underline focus-visible:underline-offset-4";

const socialIconClasses =
  "inline-flex size-10 items-center justify-center rounded-full border border-(--footer-border) bg-white/5 text-(--footer-muted) transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/50 hover:bg-teal-400/10 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-(--footer-background)";

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.11-1.52-1.11-1.52-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.71.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .28.18.61.69.5A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-teal-500 bg-(--footer-background) text-(--footer-foreground)">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div>
            <div className="w-fit origin-left scale-125">
              <LogoOnDark />
            </div>

            <p className="mt-6 max-w-sm text-sm leading-6 text-(--footer-muted)">
              DentFlow helps dental clinics manage patients, appointments,
              services, billing, staff, medical records, and payments from one
              secure platform.
            </p>

            <p className="mt-3 max-w-sm text-sm font-medium text-(--footer-foreground)">
              Modern clinic management for better patient care.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View the DentFlow GitHub repository"
                className={socialIconClasses}
              >
                <GitHubIcon />
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email DentFlow"
                className={socialIconClasses}
              >
                <MailIcon />
              </a>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Footer platform navigation">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-(--footer-foreground)">
              Platform
            </h2>

            <div className="flex flex-col gap-3">
              <Link href="/" className={linkClasses}>
                Home
              </Link>

              <Link href="/items" className={linkClasses}>
                Services
              </Link>

              <Link href="/about" className={linkClasses}>
                About
              </Link>

              <Link href="/contact" className={linkClasses}>
                Contact
              </Link>
            </div>
          </nav>

          {/* Account */}
          <nav aria-label="Footer account navigation">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-(--footer-foreground)">
              Account
            </h2>

            <div className="flex flex-col gap-3">
              <Link href="/login" className={linkClasses}>
                Login
              </Link>

              <Link href="/register" className={linkClasses}>
                Register Your Clinic
              </Link>

              <Link href="/portal" className={linkClasses}>
                Patient Portal
              </Link>

              <Link href="/appointments" className={linkClasses}>
                Appointments
              </Link>
            </div>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-(--footer-foreground)">
              Contact
            </h2>

            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className={`${linkClasses} break-all`}
              >
                {CONTACT_EMAIL}
              </a>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                GitHub repository
              </a>

              <a
                href={DEVELOPER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                Developer portfolio
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-(--footer-border)">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-6 py-5 text-center text-xs text-(--footer-muted) sm:flex-row sm:justify-between sm:gap-6 sm:px-8 sm:text-left lg:px-10">
          <p className="whitespace-nowrap">
            © {year} DentFlow. All rights reserved.
          </p>

          <p className="sm:text-right">
            Designed and developed by{" "}
            <a
              href={DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit the MasumDev website"
              className="font-semibold text-teal-300 transition-colors duration-200 hover:text-teal-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-(--footer-background)"
            >
              MasumDev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
