import LandingCMSClient from "@/components/admin/LandingCMSClient";
import { getLandingHero, getLandingFeatures, getLandingTestimonials } from "@/actions/landing";

export const dynamic = "force-dynamic";

export default async function AdminLandingPage() {
    const heroData = await getLandingHero();
    const featuresData = await getLandingFeatures();
    const testimonialsData = await getLandingTestimonials();

    return (
        <LandingCMSClient
            initialHero={heroData}
            initialFeatures={featuresData}
            initialTestimonials={testimonialsData}
        />
    );
}
