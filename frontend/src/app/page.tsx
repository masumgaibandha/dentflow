import { ClinicBenefits, PatientBenefits } from "@/components/landing/AudienceBenefits";
import { Capabilities } from "@/components/landing/Capabilities";
import { FAQ } from "@/components/landing/FAQ";
import { FeaturedServices } from "@/components/landing/FeaturedServices";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PlatformFeatures } from "@/components/landing/PlatformFeatures";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <PlatformFeatures />
      <FeaturedServices />
      <HowItWorks />
      <ClinicBenefits />
      <PatientBenefits />
      <Capabilities />
      <FAQ />
      <FinalCta />
    </PublicLayout>
  );
}
