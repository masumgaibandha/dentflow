import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="DentFlow home"
      className={`inline-flex h-14 w-36 shrink-0 items-center overflow-visible sm:h-16 sm:w-44 lg:w-48 ${className}`}
    >
      <Image
        src="/assets/primary_logo.png"
        alt=""
        aria-hidden="true"
        width={220}
        height={120}
        priority
        sizes="(max-width: 639px) 144px, (max-width: 1023px) 176px, 192px"
        className="h-10 w-auto origin-left scale-[1.35] object-contain sm:scale-[1.6] lg:scale-[2.2] dark:hidden"
      />

      <Image
        src="/assets/color_logo_transparent.png"
        alt=""
        aria-hidden="true"
        width={220}
        height={120}
        priority
        sizes="(max-width: 639px) 144px, (max-width: 1023px) 176px, 192px"
        className="hidden h-10 w-auto origin-left scale-[1.35] object-contain sm:scale-[1.6] lg:scale-[2.2] dark:block"
      />
    </Link>
  );
}

export function LogoOnDark({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="DentFlow home"
      className={`inline-flex h-12 w-44 shrink-0 items-center overflow-hidden sm:w-48 ${className}`}
    >
      <Image
        src="/assets/color_logo_transparent.png"
        alt=""
        aria-hidden="true"
        width={220}
        height={120}
        sizes="(max-width: 639px) 176px, 192px"
        className="h-10 w-auto origin-left scale-[1.25] object-contain sm:scale-[1.45]"
      />
    </Link>
  );
}

export function LogoIcon({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="DentFlow home"
      className={`inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-sm ${className}`}
    >
      <Image
        src="/assets/icon_logo.png"
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        sizes="32px"
        className="size-8 rounded-full object-contain"
      />
    </Link>
  );
}
