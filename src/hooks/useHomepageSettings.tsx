import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PricingTier } from '@/components/PricingTiersSection';

interface HeroPriceLine {
  price_original: number;
  price_current: number;
  label?: string;
}

interface HeroRenewalLine {
  text: string;
}

interface HeroSettings {
  title: string;
  title_highlight: string;
  subtitle: string;
  price_original: number;
  price_current: number;
  cta_text: string;
  badge_text: string;
  daily_renewal_text: string;
  extra_prices?: HeroPriceLine[];
  extra_renewals?: HeroRenewalLine[];
  promo_banner_text?: string;
  countdown_mode?: 'end_of_day' | 'custom';
  countdown_deadline?: string;
  image?: string;
}

interface CheckoutSettings {
  product_subtitle: string;
  product_description: string;
  badge_text: string;
  benefits: string[];
  button_text: string;
}

interface SocialProofCustomer {
  name: string;
  city: string;
  state: string;
  product?: 'gerador' | 'creditos';
}

interface SocialProofSettings {
  enabled: boolean;
  product_name: string;
  customers: SocialProofCustomer[];
  credit_options: number[];
}

interface CustomPackageOption {
  credits: number;
  price: number;
  bonus_credits?: number;
}

interface GuaranteeSettings {
  title: string;
  items: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSettings {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

interface SectionsVisibility {
  hero: boolean;
  hero_prices: boolean;
  pricing: boolean;
  features: boolean;
  why_choose: boolean;
  how_it_works: boolean;
  video: boolean;
  video_hide_controls: boolean;
  secure_purchase: boolean;
  testimonials: boolean;
  guarantee: boolean;
  stats: boolean;
  faq: boolean;
  final_cta: boolean;
}

interface MenuVisibility {
  painel_gerador: boolean;
  entrar_conta: boolean;
  compra_creditos: boolean;
  como_funciona: boolean;
  faq: boolean;
  install: boolean;
  idioma: boolean;
}

interface TrackingSettings {
  google_tag_manager: string;
  facebook_pixel: string;
  google_analytics: string;
  tiktok_pixel: string;
}

interface ToolProgressSettings {
  enabled: boolean;
  label: string;
  percentage: number;
}

interface BackgroundTextSettings {
  enabled: boolean;
  text: string;
  gradient_from: string;
  gradient_to: string;
  font_family: string;
  font_size: string;
  font_color: string;
  opacity: number; // 0-100
}

interface HomepageSettings {
  pricing_tiers: PricingTier[];
  custom_package_options: CustomPackageOption[];
  hero: HeroSettings;
  checkout: CheckoutSettings;
  social_proof: SocialProofSettings;
  guarantee: GuaranteeSettings;
  faq: FAQSettings;
  logo_url: string;
  background_url: string;
  background_overlay: number;
  background_text: BackgroundTextSettings;
  tool_progress: ToolProgressSettings;
  pix_key: string;
  pix_name: string;
  whatsapp_number: string;
  sections_visibility: SectionsVisibility;
  menu_visibility: MenuVisibility;
  tracking: TrackingSettings;
}

const defaultSettings: HomepageSettings = {
  guarantee: {
    title: 'Garantia',
    items: [
      "Garantimos a entrega e funcionamento do produto no momento da liberação.",
      "Caso ocorra reset de créditos e a plataforma ainda permita novas adições, realizamos a reposição por até 15 dias após a recarga.",
      "O prazo de 15 dias refere-se à garantia de entrega e funcionamento inicial.",
    ],
  },
  faq: {
    title: 'Como funciona a recarga de créditos?',
    subtitle: 'Tudo você precisa para usar a Lovable sem preocupações.',
    items: [
      { question: "Como funciona para gerar os créditos?", answer: "É bem simples! Tudo feito pelo workspace, enviaremos um email após o pagamento e um vídeo ensinando pelo WhatsApp." },
      { question: "Como eu sei se funciona mesmo e não é golpe?", answer: "Você pode pedir para nós enviarmos créditos para você para que você veja os resultados e o funcionamento por conta própria." },
      { question: "Está funcionando depois da atualização do Lovable?", answer: "Método atualizado em 02/04/2026." },
      { question: "Funciona em uma conta que já indicou mais de 10 convites?", answer: "Sim! Você pode resgatar créditos em uma conta que já indicou mais de 10 pessoas, desde que você tenha acesso a uma conta que já resgatou créditos nessa conta, então você pode depositar na conta desejada." },
    ],
  },
  pricing_tiers: [],
  custom_package_options: [
    { credits: 100, price: 10 },
    { credits: 200, price: 18 },
    { credits: 500, price: 40 },
  ],
  hero: {
    title: 'Créditos Infinitos na Lovable.',
    title_highlight: 'Simples. Rápido. Automático.',
    subtitle: '⚠️ A revenda do painel está pausada neste momento, mas você ainda pode aproveitar os créditos disponíveis!',
    price_original: 600,
    price_current: 199,
    cta_text: 'Comprar Agora',
    badge_text: 'Oferta Limitada',
    daily_renewal_text: '🔄 Renovação diária de 5k créditos!',
    promo_banner_text: '🔥 PROMOÇÃO DE CRÉDITOS 🔥',
    countdown_mode: 'end_of_day',
  },
  checkout: {
    product_subtitle: 'Acesso Completo',
    product_description: 'Acesso vitalício • Sem mensalidades',
    badge_text: 'Oferta Limitada',
    benefits: [
      'Acesso ao Painel',
      'Gerador de Créditos Ilimitado',
      'Suporte Premium 24/7',
      'Atualizações Gratuitas',
      'Comunidade Exclusiva'
    ],
    button_text: 'COMPRAR AGORA'
  },
  social_proof: {
    enabled: true,
    product_name: 'o Gerador',
    customers: [
      { name: "Carlos M.", city: "São Paulo", state: "SP" },
      { name: "Ana Paula S.", city: "Rio de Janeiro", state: "RJ" },
      { name: "Roberto F.", city: "Belo Horizonte", state: "MG" },
      { name: "Juliana C.", city: "Curitiba", state: "PR" },
      { name: "Fernando L.", city: "Salvador", state: "BA" },
      { name: "Mariana R.", city: "Brasília", state: "DF" },
      { name: "Pedro H.", city: "Porto Alegre", state: "RS" },
      { name: "Thiago N.", city: "Florianópolis", state: "SC" },
    ],
    credit_options: [200, 500, 1000, 2000]
  },
  logo_url: '',
  background_url: '',
  background_overlay: 0,
  background_text: {
    enabled: false,
    text: 'CRÉDITOS INFINITOS',
    gradient_from: '#1a1a2e',
    gradient_to: '#0a0a0f',
    font_family: 'Inter',
    font_size: '4xl',
    font_color: '#ffffff',
    opacity: 100,
  },
  tool_progress: {
    enabled: false,
    label: '🚀 Nova Ferramenta',
    percentage: 0,
  },
  pix_key: '+5548996029392',
  pix_name: 'Marcondes Jorge Machado',
  whatsapp_number: '5548996029392',
  sections_visibility: {
    hero: true,
    hero_prices: false,
    pricing: true,
    features: true,
    why_choose: true,
    how_it_works: true,
    video: true,
    video_hide_controls: true,
    secure_purchase: true,
    testimonials: true,
    guarantee: true,
    stats: true,
    faq: true,
    final_cta: false,
  },
  menu_visibility: {
    painel_gerador: true,
    entrar_conta: true,
    compra_creditos: false,
    como_funciona: true,
    faq: true,
    install: true,
    idioma: true,
  },
  tracking: {
    google_tag_manager: '',
    facebook_pixel: '',
    google_analytics: '',
    tiktok_pixel: '',
  },
};

export const useHomepageSettings = () => {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('homepage_settings')
        .select('key, value');

      if (fetchError) throw fetchError;

      const newSettings: HomepageSettings = { ...defaultSettings };
      
      data?.forEach((item: { key: string; value: unknown }) => {
        if (item.key === 'pricing_tiers' && Array.isArray(item.value)) {
          newSettings.pricing_tiers = item.value as PricingTier[];
        } else if (item.key === 'hero' && item.value) {
          newSettings.hero = item.value as HeroSettings;
        } else if (item.key === 'custom_package_options' && Array.isArray(item.value)) {
          newSettings.custom_package_options = item.value as CustomPackageOption[];
        } else if (item.key === 'pix_key' && typeof item.value === 'string') {
          newSettings.pix_key = item.value;
        } else if (item.key === 'pix_name' && typeof item.value === 'string') {
          newSettings.pix_name = item.value;
        } else if (item.key === 'whatsapp_number' && typeof item.value === 'string') {
          newSettings.whatsapp_number = item.value;
        } else if (item.key === 'checkout' && item.value) {
          newSettings.checkout = item.value as CheckoutSettings;
        } else if (item.key === 'social_proof' && item.value) {
          newSettings.social_proof = item.value as SocialProofSettings;
        } else if (item.key === 'guarantee' && item.value) {
          newSettings.guarantee = item.value as GuaranteeSettings;
        } else if (item.key === 'faq' && item.value) {
          newSettings.faq = item.value as FAQSettings;
        } else if (item.key === 'logo_url' && typeof item.value === 'string') {
          newSettings.logo_url = item.value;
        } else if (item.key === 'background_url' && typeof item.value === 'string') {
          newSettings.background_url = item.value;
        } else if (item.key === 'background_overlay' && typeof item.value === 'number') {
          newSettings.background_overlay = item.value;
        } else if (item.key === 'background_text' && item.value) {
          newSettings.background_text = { ...defaultSettings.background_text, ...(item.value as Partial<BackgroundTextSettings>) };
        } else if (item.key === 'tool_progress' && item.value) {
          newSettings.tool_progress = { ...defaultSettings.tool_progress, ...(item.value as Partial<ToolProgressSettings>) };
        } else if (item.key === 'sections_visibility' && item.value) {
          newSettings.sections_visibility = { ...defaultSettings.sections_visibility, ...(item.value as Partial<SectionsVisibility>) };
        } else if (item.key === 'tracking' && item.value) {
          newSettings.tracking = { ...defaultSettings.tracking, ...(item.value as Partial<TrackingSettings>) };
        } else if (item.key === 'menu_visibility' && item.value) {
          newSettings.menu_visibility = { ...defaultSettings.menu_visibility, ...(item.value as Partial<MenuVisibility>) };
        }
      });

      setSettings(newSettings);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching homepage settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = async (key: string, value: unknown) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('homepage_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('homepage_settings')
          .update({ value: value as any })
          .eq('key', key);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('homepage_settings')
          .insert({ key, value: value as any });
        if (insertError) throw insertError;
      }

      await fetchSettings();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating homepage setting:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSetting
  };
};

export type { HeroSettings, HeroPriceLine, HeroRenewalLine, CheckoutSettings, SocialProofSettings, SocialProofCustomer, HomepageSettings, CustomPackageOption, GuaranteeSettings, FAQSettings, FAQItem, SectionsVisibility, MenuVisibility, TrackingSettings, ToolProgressSettings, BackgroundTextSettings };
