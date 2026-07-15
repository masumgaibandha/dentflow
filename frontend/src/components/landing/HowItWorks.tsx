import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    step: "1",
    title: "Register your clinic",
    body: "Create an admin account and your clinic's own isolated workspace in minutes.",
  },
  {
    step: "2",
    title: "Set up your practice",
    body: "Add dentists, staff accounts, your service catalog, and your weekly operating hours.",
  },
  {
    step: "3",
    title: "Patients book & pay",
    body: "Patients browse your services, book appointments, and pay invoices securely online.",
  },
  {
    step: "4",
    title: "Manage day to day",
    body: "Track appointments, invoices, and clinical records from one clinic dashboard.",
  },
];

export function HowItWorks() {
  return (
    <Section tone="soft">
      <SectionHeading
        align="center"
        eyebrow="Getting started"
        title="How it works"
        description="From sign-up to day-to-day operations in four steps."
        className="mx-auto"
      />

      <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => (
          <div key={item.step} className="flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              {item.step}
            </span>
            <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
