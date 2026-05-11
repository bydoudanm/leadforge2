import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LiveIntelligence from '@/components/LiveIntelligence';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import DashboardPreview from '@/components/DashboardPreview';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

/**
 * LeadForge Landing Page
 * 
 * Design Philosophy: Neo-Futurism with AI Intelligence
 * - Dark, sophisticated aesthetic with blue AI accents
 * - Smooth, flowing animations that feel intelligent
 * - Premium card-based layouts with depth
 * - Asymmetric, dynamic layouts
 * 
 * Color Scheme:
 * - Background: Deep dark (#0f1419)
 * - Accents: Vibrant blue (#3b82f6) and cyan (#0ea5e9)
 * - Cards: Slate-900 with transparency
 * - Text: Light slate for contrast
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16">
        <Hero />
        <LiveIntelligence />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
