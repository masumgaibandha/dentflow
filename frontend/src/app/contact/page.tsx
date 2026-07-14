import { ContactForm } from "@/components/contact/ContactForm";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Contact us
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Have a question about DentFlow, or want to see it set up for your clinic? Send us a
          message and we&apos;ll get back to you.
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </PublicLayout>
  );
}
