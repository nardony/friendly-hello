import { useState, useEffect } from 'react';
import { FakeImplementationLog } from '@/components/FakeImplementationLog';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { WhyChooseSection } from '@/components/WhyChooseSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { VideoSection } from '@/components/VideoSection';
import { SecurePurchaseSection } from '@/components/SecurePurchaseSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { GuaranteeSection } from '@/components/GuaranteeSection';
import { StatsSection } from '@/components/StatsSection';
import { FAQSection } from '@/components/FAQSection';
import { FinalCTASection } from '@/components/FinalCTASection';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { PricingTiersSection, PricingTier } from '@/components/PricingTiersSection';
import { RechargeInfoSection } from '@/components/RechargeInfoSection';
import { CheckoutModal } from '@/components/CheckoutModal';
import backgroundHeroDefault from '@/assets/background-hero.png';
import coderCharacter from '@/assets/coder-character.png';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { TrackingScripts } from '@/components/TrackingScripts';
import { ToolProgressBar } from '@/components/ToolProgressBar';
import { TopInfoBanner } from '@/components/TopInfoBanner';

// Fallback tiers when database is loading or empty
const fallbackTiers: PricingTier[] = [
  {
    id: '1',
    name: 'Pacote Iniciante',
    credits: 1000,
    price_original: 50,
    price_current: 29.99,
    available: 50,
    sales: 127,
    checkout_link: '',
    highlight: false
  },
  {
    id: '2',
    name: 'Pacote Básico',
    credits: 5000,
    price_original: 600,
    price_current: 199,
    available: 30,
    sales: 243,
    checkout_link: '',
    highlight: true
  },
  {
    id: '3',
    name: 'Pacote Profissional',
    credits: 10000,
    price_original: 280,
    price_current: 179.99,
    available: 20,
    sales: 89,
    checkout_link: '',
    highlight: false
  },
  {
    id: '4',
    name: 'Pacote Empresarial',
    credits: 50000,
    price_original: 1200,
    price_current: 799.99,
    available: 10,
    sales: 34,
    checkout_link: '',
    highlight: false
  }
];

const Index = () => {
  const { settings, loading } = useHomepageSettings();
  const { session } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);


  // Use database tiers if available, otherwise fallback
  const tiers = settings.pricing_tiers.length > 0 ? settings.pricing_tiers : fallbackTiers;

  const handleBuyClick = (tier: PricingTier) => {
    setSelectedTier(tier);
    setCheckoutOpen(true);
  };

  const vis = settings.sections_visibility;
  const bgImage = settings.background_url || backgroundHeroDefault;
  const overlayOpacity = settings.background_overlay / 100;
  const bgText = settings.background_text;
  
  // Only show maintenance/text section when NOT logged in
  const showMaintenanceSection = bgText.enabled && !session;

  // Show nothing until settings are loaded to prevent flash of default background
  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <TopInfoBanner />
      <TrackingScripts />
      {/* Fixed background */}
      {showMaintenanceSection ? (
        <div
          className="fixed inset-0 -z-20"
          style={{
            background: `linear-gradient(135deg, ${bgText.gradient_from}, ${bgText.gradient_to})`,
          }}
        />
      ) : (
        <div
          className="fixed inset-0 -z-20"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat',
          }}
        />
      )}
      {/* Dark overlay - controlled from admin panel */}
      {overlayOpacity > 0 && (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: `hsl(240 10% 4% / ${overlayOpacity})` }} />
      )}
      <div className="flex-1">
        <Header />
        {showMaintenanceSection && (
          <section className="w-full flex items-center justify-center pt-8 sm:pt-12 md:pt-24 pb-12 sm:pb-20 md:min-h-[60vh] px-4 sm:px-6">
            <div className="text-center w-full max-w-[90%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
              <div style={{ opacity: (bgText.opacity ?? 100) / 100 }}>
                <p
                  className={`font-black leading-snug sm:leading-relaxed break-words ${
                    {
                      'xl': 'text-base sm:text-lg md:text-xl',
                      '2xl': 'text-lg sm:text-xl md:text-2xl',
                      '3xl': 'text-xl sm:text-2xl md:text-3xl',
                      '4xl': 'text-2xl sm:text-3xl md:text-4xl',
                      '5xl': 'text-2xl sm:text-4xl md:text-5xl',
                      '6xl': 'text-3xl sm:text-5xl md:text-6xl',
                    }[bgText.font_size || '4xl'] || 'text-2xl sm:text-3xl md:text-4xl'
                  }`}
                  style={{
                    fontFamily: bgText.font_family || 'Inter',
                    color: bgText.font_color || '#ffffff',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {bgText.text}
                </p>
              </div>
              {settings.tool_progress.enabled && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-foreground/70 whitespace-nowrap">
                    {settings.tool_progress.label}
                  </span>
                  <div className="w-32 sm:w-48 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, settings.tool_progress.percentage))}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                    {Math.min(100, Math.max(0, settings.tool_progress.percentage))}%
                  </span>
                </div>
              )}
              <img 
                src={coderCharacter} 
                alt="Robô programando" 
                className="mt-6 w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain animate-bounce-slow"
              />
              <FakeImplementationLog />
            </div>
          </section>
        )}
        {vis.hero && <HeroSection />}
        {vis.pricing && (
          <div id="pacotes" className={!vis.hero && !showMaintenanceSection ? 'pt-8 sm:pt-12 md:pt-24' : ''}>
            <PricingTiersSection 
              tiers={tiers} 
              customPackageOptions={settings.custom_package_options}
              primaryColor="#8B5CF6" 
              accentColor="#22C55E"
              onBuyClick={handleBuyClick}
            />
            <RechargeInfoSection />
          </div>
        )}
        {vis.video && <VideoSection />}
        {vis.features && <FeaturesSection />}
        {vis.why_choose && <WhyChooseSection />}
        {vis.how_it_works && <HowItWorksSection />}
        {vis.secure_purchase && <SecurePurchaseSection />}
        {vis.testimonials && <TestimonialsSection />}
        {vis.guarantee && <GuaranteeSection title={settings.guarantee.title} items={settings.guarantee.items} />}
        {vis.stats && <StatsSection />}
        {vis.faq && <FAQSection title={settings.faq.title} subtitle={settings.faq.subtitle} items={settings.faq.items} />}
        {vis.final_cta && <FinalCTASection />}
      </div>
      <Footer />
      <WhatsAppButton number={settings.whatsapp_number || '5548996029392'} message="Olá! Gostaria de mais informações sobre o painel." />
      <SocialProofNotification 
        enabled={settings.social_proof.enabled}
        productName={settings.social_proof.product_name}
        customers={settings.social_proof.customers}
        creditOptions={settings.social_proof.credit_options}
      />
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        tier={selectedTier}
        landingPageId="homepage"
        primaryColor="#8B5CF6"
        accentColor="#22C55E"
        pixEnabled={true}
        pixKey={settings.pix_key || '+5548996029392'}
        pixName={settings.pix_name || 'Marcondes Jorge Machado'}
        whatsappNumber={settings.whatsapp_number || '5548996029392'}
        showBalance={true}
      />
    </div>
  );
};

export default Index;
