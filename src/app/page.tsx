import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AlgorithmsSection from "@/components/landing/AlgorithmsSection";
import PartnersSection from "@/components/landing/PartnersSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <AlgorithmsSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
