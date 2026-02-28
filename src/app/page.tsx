import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import AlgorithmsSection from "@/components/landing/AlgorithmsSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { getLandingHero, getLandingFeatures, getLandingTestimonials } from "@/actions/landing";

export const revalidate = 60; // revalidate every 60s for CMS updates

export default async function HomePage() {
  const heroData = await getLandingHero();
  const featuresData = await getLandingFeatures();
  const testimonialsData = await getLandingTestimonials();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection data={heroData} />
        <FeaturesSection data={featuresData} />
        <HowItWorksSection />
        <AlgorithmsSection />
        <PricingSection />
        <TestimonialsSection data={testimonialsData} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
