import Image from "next/image";
import Link from "next/link";

// Both logo assets ship with a baked-in solid background (white / dark navy,
// not transparent) rather than a transparent PNG - so instead of detecting
// theme in JS (which would cause a flash while it resolves), each variant is
// rendered as its own <Image> and shown/hidden purely via Tailwind's `dark:`
// class variant. Because next-themes applies the `.dark` class to <html>
// synchronously before first paint, this switches instantly with no flash
// and no client component needed here at all.
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="DentFlow home"
      className={`inline-flex h-16 w-48 items-center overflow-visible ${className ?? ""}`}
    >
      <Image
        src="/assets/primary_logo.png"
        alt="DentFlow"
        width={220}
        height={120}
        priority
        className="h-10 w-auto origin-left scale-[2.2] object-contain dark:hidden"
      />

      <Image
        src="/assets/color_logo_transparent.png"
        alt="DentFlow"
        width={220}
        height={120}
        priority
        className="hidden h-10 w-auto origin-left scale-[2.2] object-contain dark:block"
      />
    </Link>
  );
}
// Dark navy footer is dark regardless of site theme (see Footer.tsx), so it
// always wants the dark-surface logo variant, never the theme-switched pair.
export function LogoOnDark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="DentFlow home"
      className={`inline-flex items-center ${className ?? ""}`}
    >
      <Image
        src="/assets/color_logo_transparent.png"
        alt="DentFlow"
        width={220}
        height={120}
        priority
        className=" h-12 w-auto origin-left scale-[2.2] object-contain"
      />
    </Link>
  );
}

// Compact mark for space-constrained contexts (mobile menu header). The
// icon's own white background is treated as an intentional badge rather than
// fought with theme-swapping, so it works the same on any surface.
export function LogoIcon({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="DentFlow home"
      className={`inline-flex items-center justify-center rounded-md bg-white p-1 shadow-sm ${className ?? ""}`}
    >
      <Image
        src="/assets/icon_logo.png"
        alt="DentFlow"
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
      />
    </Link>
  );
}
