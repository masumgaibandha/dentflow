import type { HTMLAttributes } from "react";

export type SectionTone = "default" | "soft" | "accent";

const toneClasses: Record<SectionTone, string> = {
  default: "bg-background",
  soft: "bg-background-soft",
  accent: "bg-surface-accent",
};

// Shared section rhythm/container so landing-page sections stop repeating
// their own `mx-auto max-w-6xl px-6 py-16` boilerplate, and so alternating
// white/soft backgrounds (visual rhythm) is a one-word prop, not a copy-paste.
export function Section({
  tone = "default",
  className,
  contentClassName,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  contentClassName?: string;
}) {
  return (
    <section className={`${toneClasses[tone]} py-16 sm:py-20 lg:py-24 ${className ?? ""}`} {...props}>
      <div className={`mx-auto w-full max-w-6xl px-6 ${contentClassName ?? ""}`}>{children}</div>
    </section>
  );
}
