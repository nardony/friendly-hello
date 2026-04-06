import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield, Zap, Headphones, Check, Mail, Lock, Phone, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import productPainel from '@/assets/product-painel.png';
import logoPainel from '@/assets/logo-painel.png';
import { PricingTier } from '@/components/PricingTiersSection';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { useLanguage } from '@/hooks/useLanguage';

const USD_RATE = 0.18;

const countryCodes = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+49', flag: '🇩🇪', name: 'Deutschland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+39', flag: '🇮🇹', name: 'Italia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
];

const Checkout = () => {
  const location = useLocation();
  const { settings } = useHomepageSettings();
  const { language, t } = useLanguage();

  const isEN = language === 'en';

  // Default tier when accessing /checkout directly (without selecting a package)
  const defaultTier: PricingTier = {
    id: 'default',
    name: isEN ? 'Credits Generator Panel' : 'Painel Gerador de Créditos',
    credits: 5000,
    price_original: settings.hero.price_original,
    price_current: settings.hero.price_current,
    available: 30,
    sales: 243,
    checkout_link: '',
    highlight: false
  };

  const selectedTier = (location.state as { selectedTier?: PricingTier })?.selectedTier || defaultTier;
  const { checkout } = settings;
  
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState(isEN ? '+1' : '+55');

  const convertPrice = (value: number) => isEN ? value * USD_RATE : value;

  const formatPrice = (value: number) => {
    const converted = convertPrice(value);
    return new Intl.NumberFormat(isEN ? 'en-US' : 'pt-BR', {
      style: 'currency',
      currency: isEN ? 'USD' : 'BRL',
    }).format(converted);
  };

  const calculateSavings = () => {
    if (!selectedTier.price_original || selectedTier.price_original <= selectedTier.price_current) {
      return null;
    }
    return Math.round(((selectedTier.price_original - selectedTier.price_current) / selectedTier.price_original) * 100);
  };

  const savings = calculateSavings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullWhatsapp = `${countryCode.replace('+', '')}${whatsapp.replace(/\D/g, '')}`;
    const whatsappMessage = encodeURIComponent(
      isEN
        ? `Hi! I'd like to buy ${selectedTier.name} (${selectedTier.credits.toLocaleString('en-US')} credits) for ${formatPrice(selectedTier.price_current)}. Email: ${email}, WhatsApp: +${fullWhatsapp}`
        : `Olá! Gostaria de comprar o ${selectedTier.name} (${selectedTier.credits.toLocaleString('pt-BR')} créditos) por ${formatPrice(selectedTier.price_current)}. Meu email: ${email}, WhatsApp: +${fullWhatsapp}`
    );
    window.open(`https://wa.me/${settings.whatsapp_number || '5548996029392'}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('checkout.back')}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Info */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex gap-4 mb-6">
              <img 
                src={productPainel} 
                alt="Painel Gerador" 
                className="w-40 h-28 object-cover rounded-xl border border-border/50"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {selectedTier.name}
                </h1>
                <p className="text-lg font-semibold text-foreground">{isEN ? t('checkout.full_access') : checkout.product_subtitle}</p>
                <p className="text-sm text-muted-foreground">{isEN ? t('checkout.lifetime_access') : checkout.product_description}</p>
              </div>
            </div>

            {/* Pricing cards side by side */}
            {(() => {
              const extraPrices = selectedTier.id === 'default' ? (settings.hero.extra_prices || []).filter(ep => ep.price_current > 0) : [];
              const hasExtras = extraPrices.length > 0;

              return (
                <div className={`grid gap-3 ${hasExtras ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Main offer card */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-2">
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide self-start">
                      {isEN ? t('checkout.limited_offer') : checkout.badge_text}
                    </span>
                    {selectedTier.price_original && selectedTier.price_original > selectedTier.price_current && (
                      <span className="text-muted-foreground line-through text-sm">
                        {formatPrice(selectedTier.price_original)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-accent">
                      {formatPrice(selectedTier.price_current)}
                    </span>
                    {savings && (
                      <span className="bg-accent/20 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full self-start">
                        {t('checkout.savings')} {savings}%
                      </span>
                    )}
                    {settings.hero.daily_renewal_text && selectedTier.id === 'default' && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 mt-1 self-start">
                        <RefreshCw className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">{settings.hero.daily_renewal_text}</span>
                      </div>
                    )}
                  </div>

                  {/* Extra offer cards */}
                  {extraPrices.map((ep, idx) => {
                    const extraRenewal = (settings.hero.extra_renewals || [])[idx];
                    const epSavings = ep.price_original > ep.price_current
                      ? Math.round(((ep.price_original - ep.price_current) / ep.price_original) * 100)
                      : null;
                    return (
                      <div key={idx} className="rounded-xl border border-border/50 bg-card/50 p-4 flex flex-col gap-2">
                        {ep.label && (
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{ep.label}</span>
                        )}
                        {ep.price_original > 0 && (
                          <span className="text-muted-foreground line-through text-sm">{formatPrice(ep.price_original)}</span>
                        )}
                        <span className="text-2xl font-bold text-accent">{formatPrice(ep.price_current)}</span>
                        {epSavings && (
                          <span className="bg-accent/20 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full self-start">
                            {t('checkout.savings')} {epSavings}%
                          </span>
                        )}
                        {extraRenewal?.text && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 mt-1 self-start">
                            <RefreshCw className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary">{extraRenewal.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-primary" />
                {t('checkout.secure_purchase')}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                {t('checkout.auto_delivery')}
              </div>
              <div className="flex items-center gap-1">
                <Headphones className="w-4 h-4 text-primary" />
                {t('checkout.support_24h')}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">{t('checkout.what_you_get')}</h3>
              <ul className="space-y-2">
                {(isEN
                  ? ['Lifetime Panel Access', 'Unlimited Credit Generator', 'Premium 24/7 Support', 'Free Updates', 'Exclusive Community']
                  : checkout.benefits
                ).map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-accent" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {t('checkout.your_email')}
                </label>
                <Input
                  type="email"
                  placeholder={t('checkout.email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('checkout.email_hint')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-background border border-border rounded-md px-2 py-2 text-sm text-foreground w-[100px] flex-shrink-0"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="tel"
                    placeholder={isEN ? '(000) 000-0000' : '(00) 00000-0000'}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="bg-background border-border flex-1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-3 rounded-lg">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{t('checkout.data_protected')}</span>
              </div>

              <Button type="submit" variant="hero" size="xl" className="w-full">
                {isEN ? t('checkout.buy_now') : checkout.button_text}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t('checkout.already_customer')}{' '}
                <Link to="/" className="text-primary hover:underline">
                  {t('checkout.click_here')}
                </Link>
              </p>

              <p className="text-center text-xs text-muted-foreground">
                {t('checkout.agree_terms')}{' '}
                <Link to="/termos" className="text-primary hover:underline">{t('checkout.terms')}</Link>
                {' '}{t('checkout.and')}{' '}
                <Link to="/privacidade" className="text-primary hover:underline">{t('checkout.privacy')}</Link>
              </p>

              <div className="flex justify-center mt-4">
                <img src={logoPainel} alt="Logo" className="h-10 opacity-70" />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
