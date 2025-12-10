/**
 * Homepage - On-Duty Pharmacies
 * Main landing page with map and pharmacy list
 */
import { Suspense } from 'react';
import { Header, Footer } from '@/components/layout';
import { HeroSection } from './_components/HeroSection';
import { PharmacySection } from './_components/PharmacySection';
import { FeaturesSection } from './_components/FeaturesSection';
import { CTASection } from './_components/CTASection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Pharmacies Map & List */}
        <Suspense fallback={<PharmacySectionSkeleton />}>
          <PharmacySection />
        </Suspense>

        {/* Features */}
        <FeaturesSection />

        {/* CTA for Pharmacies */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function PharmacySectionSkeleton() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="h-[500px] bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </section>
  );
}
