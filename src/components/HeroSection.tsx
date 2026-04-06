import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { TrustBadge } from './TrustBadge';
import { PanelCheckoutModal } from './PanelCheckoutModal';
import { ResellerValuesModal } from './ResellerValuesModal';
import { Zap, Shield, ChevronDown, RefreshCw, CreditCard, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productPainel from '@/assets/product-painel.png';

import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { useLanguage } from '@/hooks/useLanguage';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showReseller, setShowReseller] = useState(false);
  
  const { settings } = useHomepageSettings();
  const { hero } = settings;
  const { t, language } = useLanguage();

  const BRL_TO_USD_RATE = 0.18;

  const formatPrice = (value: number) => {
    const displayValue = language === 'en' ? value * BRL_TO_USD_RATE : value;
    return new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: language === 'pt' ? 'BRL' : 'USD',
    }).format(displayValue);
  };

  const savings = hero.price_original > hero.price_current
    ? Math.round(((hero.price_original - hero.price_current) / hero.price_original) * 100)
    : null;
  
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-14 sm:pt-20 md:pt-40 pb-8 sm:pb-12 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto w-full">
         <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

           {/* Product Image */}
           <div className="hidden lg:flex items-center justify-center">
             <img 
               src={hero.image || productPainel} 
               alt="Painel de Créditos" 
               className="w-full max-w-2xl rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.3)] border border-white/10 animate-float"
             />
           </div>

           <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-foreground">{language === 'en' ? t('hero.title') : hero.title} </span>
              <span className="text-gradient">{language === 'en' ? t('hero.title_highlight') : hero.title_highlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              {(() => {
                const text = language === 'en' ? t('hero.subtitle') : hero.subtitle;
                const parts = text.split(/\n+/);
                return parts[0];
              })()}
            </p>

            {settings.sections_visibility.hero_prices && <div className="flex flex-col items-center lg:items-start gap-3 mb-4 sm:mb-6">
              {/* Main price + its renewal */}
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start">
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">
                    {formatPrice(hero.price_original)}
                  </span>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent">
                    {formatPrice(hero.price_current)}
                  </span>
                  {savings && (
                    <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded">
                      {t('hero.savings')} {savings}%
                    </span>
                  )}
                </div>
                {hero.daily_renewal_text && (
                  <div onClick={() => navigate('/checkout')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm animate-pulse hover:bg-primary/20 transition-colors cursor-pointer">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span className="text-sm sm:text-base font-bold text-primary">
                      {hero.daily_renewal_text}
                    </span>
                  </div>
                )}
              </div>

              {/* Extra price lines, each with its own renewal below */}
              {(hero.extra_prices || []).filter(ep => ep.price_current > 0).map((ep, idx) => {
                const extraRenewal = (hero.extra_renewals || [])[idx];
                return (
                  <div key={idx} className="flex flex-col items-center lg:items-start gap-2">
                    <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start">
                      {ep.label && <span className="text-xs text-muted-foreground">{ep.label}</span>}
                      {ep.price_original > 0 && (
                        <span className="text-sm sm:text-base text-muted-foreground line-through">
                          {formatPrice(ep.price_original)}
                        </span>
                      )}
                      <span className="text-xl sm:text-2xl font-bold text-accent">
                        {formatPrice(ep.price_current)}
                      </span>
                      {ep.price_original > ep.price_current && (
                        <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded">
                          {t('hero.savings')} {Math.round(((ep.price_original - ep.price_current) / ep.price_original) * 100)}%
                        </span>
                      )}
                    </div>
                    {extraRenewal?.text && (
                      <div onClick={() => navigate('/checkout')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm animate-pulse hover:bg-primary/20 transition-colors cursor-pointer">
                        <RefreshCw className="w-4 h-4 text-primary" />
                        <span className="text-sm sm:text-base font-bold text-primary">
                          {extraRenewal.text}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>}



            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mb-4">
              <TrustBadge icon={Zap} text={t('hero.auto_delivery')} />
            </div>

            {/* Buy Panel Button */}
            <div className="flex flex-col items-center lg:items-start gap-3 mb-4">
              <Button
                size="xl"
                className="text-base sm:text-lg font-bold py-5 px-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_0_30px_hsl(var(--accent)_/_0.4)] hover:shadow-[0_0_50px_hsl(var(--accent)_/_0.6)] transition-all hover:scale-105"
                onClick={() => setShowCheckout(true)}
              >
                <CreditCard className="w-5 h-5" />
                Comprar Painel — R$ 199,00
              </Button>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base hover:underline hover:opacity-90 transition-all"
                onClick={() => setShowVideo(true)}
              >
                <Play className="w-4 h-4 fill-primary" />
                🎬 Assista aqui como funciona
              </button>
              <PanelCheckoutModal open={showCheckout} onClose={() => setShowCheckout(false)} />
              <ResellerValuesModal open={showReseller} onOpenChange={setShowReseller} />
            </div>

            {/* Video Popup */}
            {showVideo && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowVideo(false)}>
                <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="absolute -top-10 right-0 text-white hover:text-primary transition-colors z-10"
                    onClick={() => setShowVideo(false)}
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/l0ENT4d8DFY?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1${settings.sections_visibility.video_hide_controls ? '&controls=0' : '&controls=1'}`}
                      className="absolute inset-0 w-full border-0"
                      style={{ height: 'calc(100% + 120px)', top: '-60px' }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Como funciona"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center lg:items-start gap-2 mb-4">
              <button
                type="button"
                className="inline-flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-xl px-5 py-3 cursor-pointer hover:bg-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setShowReseller(true)}
              >
                <span className="text-xl">👀</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm sm:text-base font-bold text-accent">
                    👁️ Veja os valores de revenda aqui
                  </span>
                  <span className="text-xs text-accent/60">
                    Clique para ver quanto você pode lucrar
                  </span>
                </div>
              </button>
              <CountdownTimer />
            </div>

            <div className="flex flex-col items-center lg:items-start gap-1">
              <span 
                className="text-primary font-bold text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.see_plans') || 'Veja os planos abaixo'}
              </span>
              <ChevronDown 
                className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-bounce cursor-pointer hover:opacity-80 transition-opacity drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)]" 
                onClick={() => document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

          </div>
        </div>
      </div>
      
    </section>
  );
};
