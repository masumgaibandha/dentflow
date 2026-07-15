import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with DentFlow about setting up the platform for your clinic.",
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <Section tone="soft" contentClassName="max-w-xl">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">Get in touch</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-3 text-muted-foreground">
          Have a question about DentFlow, or want to see it set up for your clinic? Send us a
          message and we&apos;ll get back to you.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <ContactForm />
        </div>
      </Section>
    </PublicLayout>
  );
}
