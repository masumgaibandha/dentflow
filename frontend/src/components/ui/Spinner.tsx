// Branded loading primitives. Skeletons (components/ui/Skeleton.tsx) stay in
// use for predictable, shaped content (tables, cards) - these are for
// route-level loading (loading.tsx) and in-flight button actions, where the
// eventual content's shape isn't known ahead of time.

export function DentFlowSpinner({
  size = 24,
  label = "Loading",
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span role="status" className={`inline-flex ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="motion-safe:animate-spin"
      >
        <circle cx="12" cy="12" r="9" stroke="var(--color-border)" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ label = "Loading page" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <DentFlowSpinner size={32} label={label} />
        <p className="text-sm text-muted-foreground">{label}…</p>
      </div>
    </div>
  );
}

export function ButtonSpinner({ className }: { className?: string }) {
  return <DentFlowSpinner size={16} label="Submitting" className={className} />;
}
