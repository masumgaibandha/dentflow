import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Real, verifiable facts about the platform's architecture and scope - not
// fabricated adoption numbers or business metrics. Framed as capabilities,
// each one true of the current build.
const CAPABILITIES = [
  { value: "3", label: "Role types", detail: "Admin, staff, and patient - each with its own scoped view" },
  { value: "100%", label: "Tenant isolated", detail: "Every query is scoped to the requesting clinic" },
  {
    value: "Test-mode",
    label: "Stripe test payments",
    detail: "Secure test-mode card-payment flow with verified payment completion",
  },
  {
    value: "Immutable",
    label: "Immutable clinical records",
    detail: "Finalized records cannot be overwritten, and corrections are preserved as amendments",
  },
];

export function Capabilities() {
  return (
    <Section tone="soft">
      <SectionHeading
        align="center"
        eyebrow="Under the hood"
        title="Built for how clinics actually run"
        description="A few specifics about what's under the hood."
        className="mx-auto"
      />

      <dl className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {CAPABILITIES.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-xl border border-border bg-surface p-6 text-center shadow-sm"
          >
            <dt className="text-2xl font-bold text-balance break-words text-primary sm:text-3xl">
              {item.value}
            </dt>
            <dd className="mt-1 font-medium text-foreground">{item.label}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
