import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  CalendarIcon,
  CardIcon,
  EyeIcon,
  FileIcon,
  IconBadge,
  LayersIcon,
  ShieldIcon,
} from "@/components/landing/icons";

const FEATURES = [
  {
    title: "Multi-tenant by design",
    body: "Every clinic's patients, appointments, and records are isolated from every other clinic - no shared visibility, ever.",
    icon: <LayersIcon />,
  },
  {
    title: "Role-based access",
    body: "Admins, staff, and patients each see exactly what they're supposed to - separate dashboards, separate permissions.",
    icon: <ShieldIcon />,
  },
  {
    title: "Appointment scheduling",
    body: "Book, reschedule, and cancel appointments with automatic conflict checking against clinic hours and dentist availability.",
    icon: <CalendarIcon />,
  },
  {
    title: "Stripe test payments",
    body: "Patient invoices are paid through Stripe's test-mode card payment flow, verified server-side before an invoice is ever marked paid.",
    icon: <CardIcon />,
  },
  {
    title: "Clinical records",
    body: "Staff can document visits, finalize records, and add amendments - with a clear draft-vs-finalized workflow.",
    icon: <FileIcon />,
  },
  {
    title: "Controlled record sharing",
    body: "Clinics choose exactly which finalized records become visible to a patient in their own portal.",
    icon: <EyeIcon />,
  },
];

export function PlatformFeatures() {
  return (
    <Section tone="soft">
      <SectionHeading
        align="center"
        eyebrow="Platform"
        title="Everything a clinic needs, built in"
        description="DentFlow covers the day-to-day operations of a dental practice, end to end."
        className="mx-auto"
      />

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <IconBadge icon={feature.icon} />
            <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
