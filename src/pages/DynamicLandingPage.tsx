import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

// Helper function to handle both internal and external links
const handleCtaClick = (link: string | null, navigate: ReturnType<typeof useNavigate>) => {
  if (!link) return;
  
  // Check if it's an external URL
  if (link.startsWith('http://') || link.startsWith('https://')) {
    window.open(link, '_blank', 'noopener,noreferrer');
  } else {
    navigate(link);
  }
};
import { supabase } from '@/integrations/supabase/client';
import { generatePixPayload, generatePixQRCodeUrl } from '@/lib/pix';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, Star, Check, Shield, Clock, ArrowRight, MessageCircle, Zap, Headphones, UserPlus, LogOut, Menu, RefreshCw, Heart, Award, Mail, Phone, LockKeyhole, ChevronDown, Trash2, CreditCard, Eye, Play, X as XIcon } from 'lucide-react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { PricingTiersSection, PricingTier } from '@/components/PricingTiersSection';
import { CheckoutModal } from '@/components/CheckoutModal';
import { RechargeInfoSection } from '@/components/RechargeInfoSection';
import { PanelCheckoutModal } from '@/components/PanelCheckoutModal';
import { ResellerValuesModal } from '@/components/ResellerValuesModal';

import { APP_VERSION, LAST_UPDATE } from '@/config/version';
import { TopInfoBanner } from '@/components/TopInfoBanner';
import backgroundHero from '@/assets/background-hero.png';
import dashboardMockup from '@/assets/dashboard-mockup.png';

type SectionId = 'hero' | 'video' | 'features' | 'about' | 'how-it-works' | 'secure-purchase' | 'testimonials' | 'faq' | 'cta' | 'donation' | 'pacotes' | 'recharge-info' | 'why-choose' | 'checkout';

const defaultSectionOrder: SectionId[] = [
  'hero',
  'video',
  'pacotes',
  'recharge-info',
  'features',
  'why-choose',
  'about',
  'how-it-works',
  'secure-purchase',
  'testimonials',
  'faq',
  'cta',
  'donation',
  'checkout',
];

interface LandingPageData {
  id: string;
  slug: string;
  title: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  hero_image: string | null;
  product_image: string | null;
  background_image: string | null;
  logo_image: string | null;
  logo_size: string | null;
  price_original: number | null;
  price_current: number | null;
  price_installments: number | null;
  about_title: string | null;
  about_description: string | null;
  cta_title: string | null;
  cta_subtitle: string | null;
  color_primary: string | null;
  color_accent: string | null;
  color_background: string | null;
  color_text: string | null;
  color_text_highlight: string | null;
  color_icons: string | null;
  font_heading: string | null;
  font_body: string | null;
  video_enabled: boolean | null;
  video_title: string | null;
  video_url: string | null;
  video_thumbnail: string | null;
  video_hide_controls: boolean | null;
  donation_enabled: boolean | null;
  donation_title: string | null;
  donation_description: string | null;
  donation_pix_key: string | null;
  donation_pix_name: string | null;
  donation_qr_code: string | null;
  access_key: string | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  features: { title: string; description: string }[];
  how_it_works: { step: number; title: string; description: string }[];
  testimonials: { name: string; text: string; rating: number }[];
  faqs: { question: string; answer: string }[];
  secure_purchase_items: { title: string; description: string; icon?: string }[] | null;
  pricing_tiers: PricingTier[] | null;
  social_proof_enabled: boolean | null;
  social_proof_product_name: string | null;
  social_proof_customers: { name: string; city: string; state: string }[] | null;
  social_proof_credits: number[] | null;
  meta_title: string | null;
  meta_description: string | null;
  facebook_pixel: string | null;
  google_analytics: string | null;
  google_tag_manager: string | null;
  tiktok_pixel: string | null;
  section_order: SectionId[] | null;
  // Checkout configuration
  checkout_show_balance: boolean | null;
  checkout_balance_label: string | null;
  checkout_security_text: string | null;
  checkout_invite_enabled: boolean | null;
  checkout_invite_label: string | null;
  checkout_invite_placeholder: string | null;
  checkout_coupon_enabled: boolean | null;
  checkout_coupon_label: string | null;
  checkout_button_text: string | null;
  checkout_whatsapp_message: string | null;
  // Hero advanced fields
  hero_title_highlight: string | null;
  hero_badge_text: string | null;
  hero_daily_renewal_text: string | null;
  hero_extra_prices: { price_original: number; price_current: number; label?: string }[] | null;
  hero_extra_renewals: { text: string }[] | null;
  custom_package_options: { credits: number; price: number; bonus_credits?: number }[] | null;
  why_choose_items: string[] | null;
  // Checkout page fields
  checkout_product_subtitle: string | null;
  checkout_product_description: string | null;
  checkout_badge_text: string | null;
  checkout_benefits: string[] | null;
  checkout_enabled: boolean | null;
  nav_buttons: { id: string; label: string; enabled: boolean; action: string; target: string }[] | null;
}

type BoundaryState = {
  error: Error | null;
  info: React.ErrorInfo | null;
};

class DynamicLandingPageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  BoundaryState
> {
  state: BoundaryState = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Este é o ponto principal: capturar QUALQUER crash de render e registrar no console.
    // Assim a “tela preta” vira um erro rastreável.
    // eslint-disable-next-line no-console
    console.error('[DynamicLandingPage] render crash', error, info);
    this.setState({ info });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const qs = new URLSearchParams(window.location.search);
    const showDebug = qs.get('debug') === 'true' || qs.get('preview') === 'true';

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-4">
          <h1 className="text-xl font-semibold">Erro ao renderizar a landing page</h1>
          <p className="text-sm text-muted-foreground">
            Veja o console para detalhes. Se quiser detalhes na tela, abra com{' '}
            <code className="px-1 py-0.5 rounded bg-muted">?debug=true</code>.
          </p>
          <Card className="p-4 bg-card/60 border-border/50">
            <p className="text-sm font-mono whitespace-pre-wrap">{this.state.error.message}</p>
          </Card>

          {showDebug && (
            <Card className="p-4 bg-card/60 border-border/50">
              <p className="text-xs font-mono whitespace-pre-wrap">
                {this.state.error.stack || 'Sem stack disponível.'}
              </p>
              {this.state.info?.componentStack && (
                <>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs font-mono whitespace-pre-wrap">
                    {this.state.info.componentStack}
                  </p>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }
}

const DynamicLandingPageInner = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const hoverLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [panelCheckoutOpen, setPanelCheckoutOpen] = useState(false);
  
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showReseller, setShowReseller] = useState(false);

  // Open PanelCheckoutModal (same as admin homepage)
  const openHeroCheckout = () => {
    setPanelCheckoutOpen(true);
  };
  
  const isPreview = searchParams.get('preview') === 'true';
  const draftId = searchParams.get('draftId');
  const debug = searchParams.get('debug') === 'true' || isPreview;

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Clean mode for visitors - no header
  const isClean = searchParams.get('clean') === 'true';

  const clearHoverLeaveTimeout = () => {
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }
  };

  const handleSectionHover = (section: string) => {
    if (isPreview && window.parent !== window) {
      // Cancel pending leave to prevent rapid enter/leave flicker.
      clearHoverLeaveTimeout();
      if (hoveredSection !== section) {
        setHoveredSection(section);
      }
    }
  };

  const handleSectionLeave = () => {
    if (isPreview && window.parent !== window) {
      // Small delay prevents "blinking" when mouse crosses tight boundaries between sections.
      clearHoverLeaveTimeout();
      hoverLeaveTimeoutRef.current = setTimeout(() => {
        setHoveredSection(null);
      }, 120);
    }
  };

  const handleSectionClick = (section: string) => {
    if (isPreview && window.parent !== window) {
      window.parent.postMessage({ type: 'section-click', section }, '*');
    }
  };

  const handleSectionDelete = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    if (isPreview && window.parent !== window) {
      window.parent.postMessage({ type: 'section-delete', section }, '*');
    }
  };

  const SectionDeleteButton = ({ section }: { section: string }) => {
    if (!isPreview || hoveredSection !== section || section === 'hero' || section === 'donation') return null;
    return (
      <button
        onClick={(e) => handleSectionDelete(e, section)}
        className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg hover:opacity-90 transition-opacity"
        title="Remover seção"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Excluir
      </button>
    );
  };

  // Listen for scroll-to-section messages from parent editor
  useEffect(() => {
    if (!isPreview) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scroll-to-section' && event.data.section) {
        const sectionElement = document.querySelector(`[data-section-id="${event.data.section}"]`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPreview]);

  useEffect(() => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.debug('[DynamicLandingPage] params', { slug, isPreview, draftId });

    // eslint-disable-next-line no-console
    console.debug('[DynamicLandingPage] component types', {
      Button: typeof Button,
      Card: typeof Card,
      Accordion: typeof Accordion,
      AccordionItem: typeof AccordionItem,
      AccordionTrigger: typeof AccordionTrigger,
      AccordionContent: typeof AccordionContent,
      CountdownTimer: typeof CountdownTimer,
    });
  }, [debug, slug, isPreview, draftId]);

  useEffect(() => {
    // No modo preview, podemos carregar pelo draftId mesmo sem slug
    if (slug || (isPreview && draftId)) {
      fetchPage();
    }
  }, [slug, isPreview, draftId]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);

      if (debug) {
        const { data: sessionData } = await supabase.auth.getSession();
        // eslint-disable-next-line no-console
        console.debug('[DynamicLandingPage] session', {
          hasSession: !!sessionData.session,
          userId: sessionData.session?.user?.id,
        });
      }

      let data = null;
      let fetchError = null;

      // No modo preview com draftId, tentamos primeiro pelo ID (para o dono da página)
      if (isPreview && draftId) {
        const result = await supabase
          .from('landing_pages')
          .select('*')
          .eq('id', draftId)
          .maybeSingle();
        
        data = result.data;
        fetchError = result.error;
        
        // Se falhou (ex: não autenticado), tenta pelo slug (publicado ou não em modo preview)
        if (!data && slug) {
          // Em modo preview, permitir ver a página mesmo que não esteja publicada
          const fallbackResult = await supabase
            .from('landing_pages')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
          
          data = fallbackResult.data;
          fetchError = fallbackResult.error;
          
          // Se ainda não encontrou, tenta apenas as publicadas
          if (!data) {
            const publishedResult = await supabase
              .from('landing_pages')
              .select('*')
              .eq('slug', slug)
              .eq('is_published', true)
              .maybeSingle();
            
            data = publishedResult.data;
            fetchError = publishedResult.error;
          }
        }
      } else if (slug) {
        // Modo normal: busca apenas páginas publicadas pelo slug
        const result = await supabase
          .from('landing_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();
        
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError || !data) {
        const msg =
          typeof (fetchError as any)?.message === 'string'
            ? (fetchError as any).message
            : 'Page not found';
        throw new Error(msg);
      }
      
      setPage({
        ...data,
        features: (data.features as { title: string; description: string }[]) || [],
        how_it_works: (data.how_it_works as { step: number; title: string; description: string }[]) || [],
        testimonials: (data.testimonials as { name: string; text: string; rating: number }[]) || [],
        faqs: (data.faqs as { question: string; answer: string }[]) || [],
        section_order: (data.section_order as SectionId[]) || defaultSectionOrder,
        pricing_tiers: (data.pricing_tiers as PricingTier[]) || [],
        secure_purchase_items: (data.secure_purchase_items as { title: string; description: string; icon?: string }[]) || null,
      });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      // eslint-disable-next-line no-console
      console.error('[DynamicLandingPage] fetchPage error', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page?.meta_title) {
      document.title = page.meta_title;
    }
  }, [page]);

  // IMPORTANT: Hooks must run in the same order on every render.
  // These tracking effects must live ABOVE any conditional `return`.

  // Inject Facebook Pixel script
  useEffect(() => {
    if (page?.facebook_pixel && !isPreview) {
      const pixelContainer = document.createElement('div');
      pixelContainer.id = 'fb-pixel-container';
      pixelContainer.innerHTML = page.facebook_pixel;
      
      const scripts = pixelContainer.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.head.appendChild(newScript);
      });
      
      const noscripts = pixelContainer.querySelectorAll('noscript');
      noscripts.forEach((noscript) => {
        document.body.insertBefore(noscript.cloneNode(true), document.body.firstChild);
      });
      
      return () => {
        const container = document.getElementById('fb-pixel-container');
        if (container) container.remove();
      };
    }
  }, [page?.facebook_pixel, isPreview]);

  // Inject Google Analytics
  useEffect(() => {
    if (page?.google_analytics && !isPreview) {
      const gaValue = page.google_analytics.trim();
      
      // Check if it's just the ID (G-XXXXXXXXXX) or full script
      if (gaValue.startsWith('G-') && !gaValue.includes('<script')) {
        // Just the ID - create the standard GA4 script
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaValue}`;
        gaScript.id = 'ga-script-async';
        document.head.appendChild(gaScript);
        
        const gaInit = document.createElement('script');
        gaInit.id = 'ga-script-init';
        gaInit.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaValue}');
        `;
        document.head.appendChild(gaInit);
      } else {
        // Full script provided
        const container = document.createElement('div');
        container.id = 'ga-container';
        container.innerHTML = gaValue;
        
        container.querySelectorAll('script').forEach((script) => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
            newScript.async = true;
          } else {
            newScript.textContent = script.textContent;
          }
          document.head.appendChild(newScript);
        });
      }
      
      return () => {
        document.getElementById('ga-script-async')?.remove();
        document.getElementById('ga-script-init')?.remove();
        document.getElementById('ga-container')?.remove();
      };
    }
  }, [page?.google_analytics, isPreview]);

  // Inject Google Tag Manager
  useEffect(() => {
    if (page?.google_tag_manager && !isPreview) {
      const gtmValue = page.google_tag_manager.trim();
      
      // Check if it's just the ID (GTM-XXXXXXX) or full script
      if (gtmValue.startsWith('GTM-') && !gtmValue.includes('<script')) {
        // Just the ID - create the standard GTM script
        const gtmScript = document.createElement('script');
        gtmScript.id = 'gtm-script';
        gtmScript.textContent = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmValue}');
        `;
        document.head.insertBefore(gtmScript, document.head.firstChild);
        
        // Add noscript fallback
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.id = 'gtm-noscript';
        gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmValue}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(gtmNoscript, document.body.firstChild);
      } else {
        // Full script provided
        const container = document.createElement('div');
        container.id = 'gtm-container';
        container.innerHTML = gtmValue;
        
        container.querySelectorAll('script').forEach((script) => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.head.insertBefore(newScript, document.head.firstChild);
        });
        
        container.querySelectorAll('noscript').forEach((noscript) => {
          document.body.insertBefore(noscript.cloneNode(true), document.body.firstChild);
        });
      }
      
      return () => {
        document.getElementById('gtm-script')?.remove();
        document.getElementById('gtm-noscript')?.remove();
        document.getElementById('gtm-container')?.remove();
      };
    }
  }, [page?.google_tag_manager, isPreview]);

  // Inject TikTok Pixel
  useEffect(() => {
    if (page?.tiktok_pixel && !isPreview) {
      const ttValue = page.tiktok_pixel.trim();
      
      // Check if it's just the ID or full script
      if (/^\d+$/.test(ttValue)) {
        // Just the pixel ID - create the standard TikTok Pixel script
        const ttScript = document.createElement('script');
        ttScript.id = 'tiktok-pixel-script';
        ttScript.textContent = `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${ttValue}');
            ttq.page();
          }(window, document, 'ttq');
        `;
        document.head.appendChild(ttScript);
      } else {
        // Full script provided
        const container = document.createElement('div');
        container.id = 'tiktok-pixel-container';
        container.innerHTML = ttValue;
        
        container.querySelectorAll('script').forEach((script) => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.head.appendChild(newScript);
        });
      }
      
      return () => {
        document.getElementById('tiktok-pixel-script')?.remove();
        document.getElementById('tiktok-pixel-container')?.remove();
      };
    }
  }, [page?.tiktok_pixel, isPreview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-6">Esta página não existe ou não está publicada.</p>
        {debug && error?.message && (
          <Card className="max-w-2xl w-full text-left p-4 mb-6 bg-card/60 border-border/50">
            <p className="text-xs font-mono whitespace-pre-wrap">{error.message}</p>
          </Card>
        )}
        <Button onClick={() => navigate('/')}>Voltar ao início</Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Convert hex to HSL for CSS variables
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const primaryHsl = hexToHsl(page.color_primary || '#8B5CF6');
  const accentHsl = hexToHsl(page.color_accent || '#10B981');

  const fontHeading = page.font_heading || 'Inter';
  const fontBody = page.font_body || 'Inter';

  // Get the section order (use stored order as-is, sections not included were disabled by user)
  const sectionOrder = (page.section_order as SectionId[]) || defaultSectionOrder;

  // Generate PIX link for banking apps
  const generatePixLink = (pixKey: string) => {
    const key = (pixKey || '').trim();
    // PIX keys can be CPF/CNPJ, phone, email or random key. Do not strip non-digits.
    // Deep-link support varies by bank/app; this is best-effort.
    return key ? `pix:${key}` : '';
  };

  const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  // Copy to clipboard function with fallback
  const copyToClipboard = async (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for non-secure contexts or older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      // Last resort fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    }
  };
  const renderHeroSection = () => (
    <section 
      key="hero"
      data-section-id="hero"
      className={`relative min-h-screen flex items-center justify-center px-3 sm:px-4 ${isClean ? 'pt-8' : 'pt-24 sm:pt-28 md:pt-32'} pb-8 sm:pb-12 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'hero' ? 'ring-2 ring-primary ring-inset' : ''}`}
      onMouseEnter={() => handleSectionHover('hero')}
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Product Image */}
          <div 
            className={`relative transition-all duration-200 p-2 -m-2 rounded-2xl cursor-pointer order-2 lg:order-1 ${hoveredSection === 'images' ? 'ring-4 ring-primary bg-primary/10' : ''}`}
            onMouseEnter={(e) => { e.stopPropagation(); handleSectionHover('images'); }}
            onClick={(e) => { e.stopPropagation(); handleSectionClick('images'); }}
          >
            <div className="relative animate-float">
              {/* Glow effect behind image */}
              <div 
                className="absolute inset-0 blur-3xl opacity-60 scale-90 rounded-full"
                style={{
                  background: `radial-gradient(circle, hsl(${primaryHsl} / 0.6) 0%, hsl(${accentHsl} / 0.4) 50%, transparent 70%)`
                }}
              />
              <img 
                src={page.product_image || dashboardMockup} 
                alt="Dashboard Preview" 
                className="relative w-full max-w-md lg:max-w-2xl mx-auto drop-shadow-2xl pointer-events-none"
                style={{
                  filter: `drop-shadow(0 0 30px hsl(${primaryHsl} / 0.5)) drop-shadow(0 0 60px hsl(${accentHsl} / 0.3))`
                }}
              />
            </div>
            {hoveredSection === 'images' && isPreview && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium shadow-lg z-10">
                📸 Clique para editar
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            {/* Main heading */}
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              style={{ fontFamily: fontHeading }}
            >
              <span style={{ color: page.color_text || '#ffffff' }}>
                {page.hero_title_highlight 
                  ? (page.hero_title || page.title)
                  : (page.hero_title || page.title).split('.')[0] + '. '
                }
              </span>
              <span style={{ color: page.color_text_highlight || '#a855f7' }}>
                {page.hero_title_highlight || (page.hero_title || page.title).split('.').slice(1).join('.') || 'Simples. Rápido. Automático.'}
              </span>
            </h1>
            
            {page.hero_subtitle && (
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                {page.hero_subtitle}
              </p>
            )}

            {/* Trust badges + Reseller values button */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
                <Zap className="w-4 h-4" style={{ color: page.color_icons || '#8B5CF6' }} />
                <span className="text-sm text-muted-foreground">Entrega Automática</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
                <Shield className="w-4 h-4" style={{ color: page.color_icons || '#8B5CF6' }} />
              </div>
            </div>

            {/* Buy Panel Button */}
            <div className="flex flex-col items-center lg:items-start gap-3 mb-4">
              <Button
                size="lg"
                className="text-base sm:text-lg font-bold py-5 px-8 text-white shadow-lg hover:scale-105 transition-all"
                style={{ 
                  backgroundColor: `hsl(${accentHsl})`,
                  boxShadow: `0 0 30px hsl(${accentHsl} / 0.4)`
                }}
                onClick={() => openHeroCheckout()}
              >
                <CreditCard className="w-5 h-5" />
                Comprar Painel — R$ {(page.price_current || 199).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Button>
              {page.video_url && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 font-semibold text-sm sm:text-base hover:underline hover:opacity-90 transition-all"
                  style={{ color: `hsl(${primaryHsl})` }}
                  onClick={() => setShowVideoPopup(true)}
                >
                  <Play className="w-4 h-4" style={{ fill: `hsl(${primaryHsl})` }} />
                  🎬 Assista aqui como funciona
                </button>
              )}
            </div>

            {/* Video Popup */}
            {showVideoPopup && page.video_url && (() => {
              const getYTUrl = (url: string) => {
                if (url.includes('youtu.be')) return `https://www.youtube.com/embed/${url.split('/').pop()?.split('?')[0]}`;
                if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${new URLSearchParams(url.split('?')[1]).get('v')}`;
                return null;
              };
              const ytUrl = getYTUrl(page.video_url);
              return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowVideoPopup(false)}>
                  <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="absolute -top-10 right-0 text-white hover:opacity-70 transition-colors z-10" onClick={() => setShowVideoPopup(false)}>
                      <XIcon className="w-8 h-8" />
                    </button>
                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                      {ytUrl ? (
                        <iframe
                          src={`${ytUrl}?autoplay=1&rel=0&modestbranding=1${page.video_hide_controls ? '&controls=0' : ''}`}
                          className="absolute inset-0 w-full h-full border-0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title="Como funciona"
                        />
                      ) : (
                        <video src={page.video_url} className="absolute inset-0 w-full h-full" autoPlay controls={!page.video_hide_controls} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Reseller values banner */}
            <div className="flex flex-col items-center lg:items-start gap-2 mb-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-[hsl(var(--dynamic-primary))]/10 border border-[hsl(var(--dynamic-primary))]/30 rounded-xl px-5 py-3 cursor-pointer hover:bg-[hsl(var(--dynamic-primary))]/20 transition-colors"
                onClick={() => setShowReseller(true)}
              >
                <span className="text-lg">👀</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm sm:text-base font-bold" style={{ color: 'hsl(var(--dynamic-primary))' }}>
                    👁️ Veja os valores de revenda aqui
                  </span>
                  <span className="text-xs opacity-70" style={{ color: 'hsl(var(--dynamic-primary))' }}>
                    Clique para ver quanto você pode lucrar
                  </span>
                </div>
              </button>
            </div>

            {/* Prices section */}
            {page.price_current && (() => {
              const savings = page.price_original && page.price_original > page.price_current
                ? Math.round(((page.price_original - page.price_current) / page.price_original) * 100)
                : null;
              return (
                <div className="flex flex-col items-center lg:items-start gap-3 mb-4 sm:mb-6">
                  <div className="flex flex-col items-center lg:items-start gap-2">
                    <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start">
                      {page.price_original && (
                        <span className="text-lg sm:text-xl text-muted-foreground line-through">
                          {formatPrice(page.price_original)}
                        </span>
                      )}
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: `hsl(${accentHsl})` }}>
                        {formatPrice(page.price_current)}
                      </span>
                      {savings && (
                        <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `hsl(${accentHsl} / 0.2)`, color: `hsl(${accentHsl})` }}>
                          Economia de {savings}%
                        </span>
                      )}
                    </div>
                    {page.hero_daily_renewal_text && (
                      <div 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm animate-pulse cursor-pointer transition-colors"
                        style={{ borderColor: `hsl(${primaryHsl} / 0.3)`, backgroundColor: `hsl(${primaryHsl} / 0.1)` }}
                        onClick={() => openHeroCheckout()}
                      >
                        <RefreshCw className="w-4 h-4" style={{ color: `hsl(${primaryHsl})` }} />
                        <span className="text-sm sm:text-base font-bold" style={{ color: `hsl(${primaryHsl})` }}>{page.hero_daily_renewal_text}</span>
                      </div>
                    )}
                  </div>
                  {(page.hero_extra_prices as any[] || []).filter((ep: any) => ep.price_current > 0).map((ep: any, idx: number) => {
                    const extraRenewal = (page.hero_extra_renewals as any[] || [])[idx];
                    const epSavings = ep.price_original > ep.price_current ? Math.round(((ep.price_original - ep.price_current) / ep.price_original) * 100) : null;
                    return (
                      <div key={idx} className="flex flex-col items-center lg:items-start gap-2">
                        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start">
                          {ep.label && <span className="text-xs text-muted-foreground">{ep.label}</span>}
                          {ep.price_original > 0 && <span className="text-sm sm:text-base text-muted-foreground line-through">{formatPrice(ep.price_original)}</span>}
                          <span className="text-xl sm:text-2xl font-bold" style={{ color: `hsl(${accentHsl})` }}>{formatPrice(ep.price_current)}</span>
                          {epSavings && <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `hsl(${accentHsl} / 0.2)`, color: `hsl(${accentHsl})` }}>Economia de {epSavings}%</span>}
                        </div>
                        {extraRenewal?.text && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm animate-pulse cursor-pointer transition-colors" style={{ borderColor: `hsl(${primaryHsl} / 0.3)`, backgroundColor: `hsl(${primaryHsl} / 0.1)` }} onClick={() => openHeroCheckout()}>
                            <RefreshCw className="w-4 h-4" style={{ color: `hsl(${primaryHsl})` }} />
                            <span className="text-sm sm:text-base font-bold" style={{ color: `hsl(${primaryHsl})` }}>{extraRenewal.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Countdown */}
            <div className="flex justify-center lg:justify-start mb-4">
              <CountdownTimer />
            </div>

            {/* See plans below */}
            <div className="flex flex-col items-center lg:items-start gap-1">
              <span 
                className="font-bold text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: `hsl(${primaryHsl})` }}
                onClick={() => document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Pacotes de Créditos Avulsos Abaixo!
              </span>
              <ChevronDown 
                className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: `hsl(${primaryHsl})`, filter: `drop-shadow(0 0 12px hsl(${primaryHsl} / 0.6))` }}
                onClick={() => document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

          </div>
        </div>
      </div>
      
    </section>
  );

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${url.split('/').pop()?.split('?')[0]}`;
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = new URLSearchParams(url.split('?')[1]).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const renderVideoSection = () => {
    if (!page.video_enabled || !page.video_url) return null;
    
    const youtubeEmbedUrl = getYouTubeEmbedUrl(page.video_url);
    const isYouTube = !!youtubeEmbedUrl;

    return (
      <section 
        key="video"
        data-section-id="video"
        className={`py-20 px-4 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'video' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('video')}
        onClick={() => handleSectionClick('video')}
      >
        <div className="max-w-4xl mx-auto">
          {page.video_title && (
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-8"
              style={{ fontFamily: fontHeading }}
            >
              {page.video_title}
            </h2>
          )}
          
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 shadow-2xl">
            {isYouTube ? (
              <iframe
                src={`${youtubeEmbedUrl}?rel=0&modestbranding=1&iv_load_policy=3${page.video_hide_controls ? '&controls=0' : ''}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={page.video_title || 'Video'}
              />
            ) : (
              <video 
                src={page.video_url}
                poster={page.video_thumbnail || undefined}
                controls={!page.video_hide_controls}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover"
              >
                Seu navegador não suporta vídeos.
              </video>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderFeaturesSection = () => {
    if (page.features.length === 0) return null;
    
    // Icons for features (cycle through if there are more than 3)
    const featureIcons = [
      <svg key="monitor" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>,
      <svg key="grid" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>,
      <svg key="infinity" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"></path>
      </svg>,
    ];
    
    return (
      <section 
        key="features"
        data-section-id="features"
        className={`py-20 px-4 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'features' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('features')}
        onClick={() => handleSectionClick('features')}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header with title and description */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: fontHeading }}>
              O que é o <span style={{ color: page.color_text_highlight || '#a855f7' }}>Painel</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Uma ferramenta automatizada que gera créditos para sua conta Lovable de forma simples e rápida.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {page.features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${page.color_icons || '#8B5CF6'}20`, color: page.color_icons || '#8B5CF6' }}
                >
                  {featureIcons[index % featureIcons.length]}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: fontHeading }}>{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderAboutSection = () => {
    if (!page.about_title) return null;
    return (
      <section 
        key="about"
        data-section-id="about"
        className={`py-20 px-4 bg-card/30 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'about' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('about')}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: fontHeading }}>{page.about_title}</h2>
          {page.about_description && (
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {page.about_description}
            </p>
          )}
        </div>
      </section>
    );
  };

  const renderHowItWorksSection = () => {
    if (page.how_it_works.length === 0) return null;
    return (
      <section 
        key="how-it-works"
        data-section-id="how-it-works"
        id="how-it-works"
        className={`py-20 px-4 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'how-it-works' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('how-it-works')}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Como <span style={{ color: page.color_text_highlight || '#a855f7' }}>funciona</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {page.how_it_works.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ backgroundColor: `${page.color_icons || '#8B5CF6'}20`, color: page.color_icons || '#8B5CF6' }}>
                  {index + 1}
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderTestimonialsSection = () => {
    if (page.testimonials.length === 0) return null;
    return (
      <section 
        key="testimonials"
        data-section-id="testimonials"
        className={`py-20 px-4 bg-card/30 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'testimonials' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('testimonials')}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            O que nossa <span style={{ color: page.color_text_highlight || '#a855f7' }}>comunidade</span> diz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {page.testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${page.color_icons || '#8B5CF6'}20` }}>
                    <MessageCircle className="w-5 h-5" style={{ color: page.color_icons || '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">Cliente verificado</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderFaqSection = () => {
    if (!page.faqs || page.faqs.length === 0) return null;
    return (
      <section 
        key="faq"
        data-section-id="faq"
        id="faq"
        className={`py-20 px-4 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'faq' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('faq')}
        onClick={() => handleSectionClick('faq')}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ fontFamily: fontHeading }}>
            Por que <span style={{ color: `hsl(${primaryHsl})` }}>escolher</span> o painel?
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Tudo você precisa para usar a Lovable sem preocupações.
          </p>
          
          <Accordion type="single" collapsible className="space-y-3">
            {page.faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-6"
                style={{
                  '--accordion-primary': `hsl(${primaryHsl})`,
                } as React.CSSProperties}
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="text-foreground font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    );
  };

  const renderCtaSection = () => (
    <section 
      key="cta"
      data-section-id="cta"
      className={`py-20 px-4 relative ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'cta' ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}`}
      onMouseEnter={() => handleSectionHover('cta')}
      onMouseLeave={handleSectionLeave}
      onClick={() => handleSectionClick('cta')}
    >
      {hoveredSection === 'cta' && isPreview && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium shadow-lg z-10">
          💰 Clique para editar CTA
        </div>
      )}
      <div className="max-w-4xl mx-auto text-center">
        <div 
          className="rounded-2xl p-8 md:p-12 border"
          style={{
            background: `linear-gradient(to right, hsl(${primaryHsl} / 0.2), hsl(${accentHsl} / 0.2))`,
            borderColor: `hsl(${primaryHsl} / 0.3)`
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: fontHeading }}>
            {page.cta_title || 'Pronto para começar?'}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            {page.cta_subtitle || 'Garanta seu acesso agora e transforme seus resultados'}
          </p>
          
          {(page.price_current || page.price_original) && (
            <div className="mb-8">
              {page.price_original && (
                <p className="text-xl text-muted-foreground line-through mb-1">
                  {formatPrice(page.price_original)}
                </p>
              )}
              {page.price_current && (
                <p className="text-5xl font-bold" style={{ color: `hsl(${accentHsl})` }}>
                  {formatPrice(page.price_current)}
                </p>
              )}
              {page.price_installments && page.price_current && (
                <p className="text-sm text-muted-foreground mt-2">
                  ou {page.price_installments}x de {formatPrice(page.price_current / page.price_installments)}
                </p>
              )}
            </div>
          )}

          <Button 
            size="lg" 
            className="text-lg px-12 text-white"
            style={{ 
              backgroundColor: `hsl(${accentHsl})`,
              boxShadow: `0 0 20px hsl(${accentHsl} / 0.4)`
            }}
            onClick={(e) => {
              if (isPreview) {
                e.preventDefault();
                handleSectionClick('cta');
                return;
              }
              openHeroCheckout();
            }}
          >
            {page.hero_cta_text || 'Comprar Agora'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: page.color_icons || '#8B5CF6' }} />
              <span>Compra segura</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: page.color_icons || '#8B5CF6' }} />
              <span>Acesso imediato</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderDonationSection = () => {
    if (page.donation_enabled === false) return null;
    return (
      <section 
        key="donation"
        data-section-id="donation"
        className={`py-12 px-4 border-t border-border/30 relative ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'donation' ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}`}
        onMouseEnter={() => handleSectionHover('donation')}
        onMouseLeave={handleSectionLeave}
        onClick={() => handleSectionClick('donation')}
      >
        {hoveredSection === 'donation' && isPreview && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium shadow-lg z-10">
            💚 Clique para editar Doação
          </div>
        )}
        <div className="max-w-2xl mx-auto text-center">
          <div 
            className="rounded-2xl p-6 border"
            style={{
              background: `linear-gradient(to right, hsl(${primaryHsl} / 0.1), hsl(${accentHsl} / 0.1))`,
              borderColor: `hsl(${primaryHsl} / 0.2)`
            }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: fontHeading }}>
              {page.donation_title || '💚 Apoie o Desenvolvedor'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {page.donation_description || 'Gostou do sistema? Considere fazer uma doação via PIX para ajudar no desenvolvimento!'}
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* QR Code - auto-generated from PIX key */}
              {(() => {
                const pixKey = page.donation_pix_key || '48996029392';
                const pixName = page.donation_pix_name || 'Marcondes Jorge Machado';
                const qrSrc = page.donation_qr_code || generatePixQRCodeUrl(
                  generatePixPayload({ pixKey, merchantName: pixName }),
                  200
                );
                return (
                <a 
                  href={generatePixLink(pixKey)}
                  className="bg-white p-3 rounded-lg cursor-pointer hover:shadow-lg hover:scale-105 transition-all group"
                  title="Clique para abrir no app do banco"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isPreview) {
                      e.preventDefault();
                      handleSectionClick('donation');
                      return;
                    }
                    const pixPayload = generatePixPayload({ pixKey, merchantName: pixName });
                    if (!isMobileDevice()) {
                      e.preventDefault();
                      const ok = await copyToClipboard(pixPayload);
                      if (ok) toast.success('Código PIX copiado!');
                    } else {
                      await copyToClipboard(pixPayload);
                    }
                  }}
                >
                  <img 
                    src={qrSrc} 
                    alt="QR Code PIX" 
                    className="w-40 h-40 object-contain"
                  />
                  <p className="text-xs text-gray-600 text-center mt-2 group-hover:text-primary transition-colors">
                    📱 Toque para abrir no app
                  </p>
                </a>
                );
              })()}
              
              {/* PIX Info */}
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Chave PIX:</p>
                <p 
                  className="text-lg font-bold font-mono"
                  style={{ color: `hsl(${accentHsl})` }}
                >
                  {page.donation_pix_key || '48996029392'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {page.donation_pix_name || 'Marcondes Jorge Machado'}
                </p>
                
                {/* Button to open in bank app */}
                {(() => {
                  const donationKey = (page.donation_pix_key || '48996029392').trim();
                  const donationName = page.donation_pix_name || 'Marcondes Jorge Machado';
                  const pixPayloadStr = generatePixPayload({ pixKey: donationKey, merchantName: donationName });
                  const pixUri = `https://nubank.com.br/cobrar/pix/copia-e-cola?code=${encodeURIComponent(pixPayloadStr)}`;
                  
                  return (
                    <>
                      <a
                        href={`pix:${donationKey}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105"
                        style={{ backgroundColor: `hsl(${accentHsl})` }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (isPreview) {
                            e.preventDefault();
                            handleSectionClick('donation');
                            return;
                          }

                          // Always copy the full PIX payload for pasting
                          const success = await copyToClipboard(pixPayloadStr);

                          if (isMobileDevice()) {
                            // Let the default href try to open bank app
                            if (success) toast.success('Código PIX copiado! Cole no app do banco.');
                            return;
                          }

                          // On desktop, prevent navigation and just copy
                          e.preventDefault();
                          if (success) {
                            toast.success('Código PIX copiado! Cole no app do seu banco.');
                          } else {
                            toast.error('Não foi possível copiar. Copie manualmente a chave.');
                          }
                        }}
                      >
                        <span>📱</span> Abrir no App do Banco
                      </a>

                      <p className="text-xs text-muted-foreground">
                        Dica: esse botão costuma funcionar apenas no celular. Se não abrir, use "Copiar Chave PIX".
                      </p>

                      {/* Copy PIX payload button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (isPreview) {
                            handleSectionClick('donation');
                            return;
                          }

                          const success = await copyToClipboard(pixPayloadStr, e);
                          if (success) {
                            toast.success('Código PIX copiado!');
                          } else {
                            toast.error('Não foi possível copiar. Tente novamente.');
                          }
                        }}
                      >
                        📋 Copiar Chave PIX
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderSecurePurchaseSection = () => {
    // Helper to get icon component by name
    const getIconByName = (iconName: string) => {
      const icons: Record<string, React.ReactNode> = {
        'Shield': <Shield className="w-5 h-5" />,
        'Zap': <Zap className="w-5 h-5" />,
        'Headphones': <Headphones className="w-5 h-5" />,
        'RefreshCw': <RefreshCw className="w-5 h-5" />,
        'Check': <Check className="w-5 h-5" />,
        'Star': <Star className="w-5 h-5" />,
        'Heart': <Heart className="w-5 h-5" />,
        'Award': <Award className="w-5 h-5" />,
      };
      return icons[iconName] || <Shield className="w-5 h-5" />;
    };

    // Use custom items from database or fallback to defaults
    const securePurchaseItems = (page.secure_purchase_items as { title: string; description: string; icon?: string }[]) || [];
    
    const defaultItems = [
      { icon: 'Shield', title: "Produto Testado", description: "Ferramenta validada e funcionando perfeitamente." },
      { icon: 'Zap', title: "Entrega Automática", description: "Receba acesso imediato após a confirmação do pagamento." },
      { icon: 'Headphones', title: "Suporte Disponível", description: "Equipe pronta para ajudar sempre que precisar." },
      { icon: 'RefreshCw', title: "Atualizações Gratuitas", description: "Melhorias constantes sem custo adicional." }
    ];

    const itemsToRender = securePurchaseItems.length > 0 ? securePurchaseItems : defaultItems;

    return (
      <section 
        key="secure-purchase"
        data-section-id="secure-purchase"
        className={`py-20 px-4 transition-all ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'secure-purchase' ? 'ring-2 ring-primary ring-inset' : ''}`}
        onMouseEnter={() => handleSectionHover('secure-purchase')}
        onClick={() => isPreview && handleSectionClick('secure-purchase')}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: fontHeading }}>
              Compra <span style={{ color: page.color_text_highlight || '#a855f7' }}>Segura</span>
            </h2>
            <p className="text-muted-foreground">
              Sua confiança é nossa prioridade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {itemsToRender.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${page.color_icons || '#8B5CF6'}20`, color: page.color_icons || '#8B5CF6' }}
                >
                  {getIconByName(item.icon || 'Shield')}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Map section IDs to render functions
  const sectionRenderers: Record<SectionId, () => React.ReactNode> = {
    'hero': renderHeroSection,
    'video': renderVideoSection,
    'pacotes': () => {
      const tiers = (page.pricing_tiers as PricingTier[]) || [];
      const promoText = (page as any).promo_text;
      const promoLink = (page as any).promo_link;
      return (
        <>
          {tiers.length > 0 && (
            <PricingTiersSection
              tiers={tiers}
              customPackageOptions={(page.custom_package_options as any[]) || []}
              primaryColor={page.color_primary || '#8B5CF6'}
              accentColor={page.color_accent || '#22C55E'}
              isPreview={isPreview}
              onTierClick={() => handleSectionClick('pacotes')}
              onBuyClick={(tier) => {
                setSelectedTier(tier);
                setCheckoutModalOpen(true);
              }}
              promoText={promoText}
              promoLink={promoLink}
            />
          )}
          {!tiers.length && promoText && (
            <div className="py-8 text-center">
              <a
                href={promoLink || '#'}
                target={promoLink ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="font-semibold text-sm sm:text-base cursor-pointer hover:underline hover:opacity-80 transition-all inline-flex items-center gap-1 flex-col"
                style={{ color: page.color_primary || '#8B5CF6' }}
              >
                {promoText}
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </a>
            </div>
          )}
        </>
      );
    },
    'recharge-info': () => <RechargeInfoSection />,
    'features': renderFeaturesSection,
    'why-choose': () => {
      const items = (page.why_choose_items as string[]) || [];
      if (items.length === 0) return null;
      return (
        <section key="why-choose" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ fontFamily: fontHeading }}>
                Por que <span style={{ color: page.color_text_highlight || '#a855f7' }}>escolher</span> o painel?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
                Tudo que você precisa para usar a Lovable sem preocupações.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {items.map((text, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-3 sm:px-5 py-2 sm:py-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: page.color_primary || '#8B5CF6' }}>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm" style={{ color: page.color_text || '#ffffff' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },
    'about': renderAboutSection,
    'how-it-works': renderHowItWorksSection,
    'secure-purchase': renderSecurePurchaseSection,
    'testimonials': renderTestimonialsSection,
    'faq': renderFaqSection,
    'cta': renderCtaSection,
    'donation': renderDonationSection,
    'checkout': () => {
      if (!page.checkout_enabled) return null;
      const benefits = (page.checkout_benefits as string[]) || ['Acesso ao Painel', 'Gerador de Créditos Ilimitado', 'Suporte Premium 24/7', 'Atualizações Gratuitas', 'Comunidade Exclusiva'];
      const tiers = (page.pricing_tiers as PricingTier[]) || [];
      const mainTier = tiers[0] || { id: 'default', name: 'Painel Gerador', credits: 5000, price_original: 150, price_current: 99.99, available: 30, sales: 243, checkout_link: '' };
      const extraTiers = tiers.slice(1);

      const calculateSavings = (original: number, current: number) => {
        if (!original || original <= current) return null;
        return Math.round(((original - current) / original) * 100);
      };

      return (
        <section
          key="checkout"
          id="checkout"
          data-section-id="checkout"
          className={`py-12 px-4 ${isPreview ? 'cursor-pointer' : ''} ${hoveredSection === 'checkout' ? 'ring-2 ring-primary ring-inset' : ''}`}
          onMouseEnter={() => handleSectionHover('checkout')}
          onClick={() => handleSectionClick('checkout')}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Info */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <div className="flex gap-4 mb-6">
                  <img
                    src={page.product_image || page.logo_image || '/defaults/product.png'}
                    alt="Produto"
                    className="w-40 h-28 object-cover rounded-xl border border-border/50"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: fontHeading }}>
                      {mainTier.name || 'Painel Gerador de Créditos'}
                    </h2>
                    <p className="text-lg font-semibold text-foreground">{page.checkout_product_subtitle || 'Acesso Completo'}</p>
                    <p className="text-sm text-muted-foreground">{page.checkout_product_description || 'Acesso vitalício • Sem mensalidades'}</p>
                  </div>
                </div>

                {/* Pricing cards */}
                <div className={`grid gap-3 ${extraTiers.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Main offer */}
                  <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ borderColor: `hsl(${primaryHsl} / 0.3)`, backgroundColor: `hsl(${primaryHsl} / 0.05)` }}>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide self-start text-white" style={{ backgroundColor: `hsl(${primaryHsl})` }}>
                      {page.checkout_badge_text || 'OFERTA LIMITADA'}
                    </span>
                    {mainTier.price_original > mainTier.price_current && (
                      <span className="text-muted-foreground line-through text-sm">R$ {mainTier.price_original.toFixed(2).replace('.', ',')}</span>
                    )}
                    <span className="text-2xl font-bold" style={{ color: `hsl(${accentHsl})` }}>
                      R$ {mainTier.price_current.toFixed(2).replace('.', ',')}
                    </span>
                    {(() => {
                      const s = calculateSavings(mainTier.price_original, mainTier.price_current);
                      return s ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-start" style={{ backgroundColor: `hsl(${accentHsl} / 0.2)`, color: `hsl(${accentHsl})` }}>
                          Economia de {s}%
                        </span>
                      ) : null;
                    })()}
                    {mainTier.daily_renewal && mainTier.daily_renewal > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border mt-1 self-start" style={{ borderColor: `hsl(${primaryHsl} / 0.3)`, backgroundColor: `hsl(${primaryHsl} / 0.1)` }}>
                        <RefreshCw className="w-3 h-3" style={{ color: `hsl(${primaryHsl})` }} />
                        <span className="text-[10px] font-bold" style={{ color: `hsl(${primaryHsl})` }}>Renovação diária de {mainTier.daily_renewal.toLocaleString('pt-BR')} créditos/dia !</span>
                      </div>
                    )}
                  </div>

                  {/* Extra tiers */}
                  {extraTiers.map((tier, idx) => {
                    const s = calculateSavings(tier.price_original, tier.price_current);
                    return (
                      <div key={idx} className="rounded-xl border border-border/50 bg-card/50 p-4 flex flex-col gap-2">
                        {tier.name && <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{tier.name}</span>}
                        {tier.price_original > tier.price_current && (
                          <span className="text-muted-foreground line-through text-sm">R$ {tier.price_original.toFixed(2).replace('.', ',')}</span>
                        )}
                        <span className="text-2xl font-bold" style={{ color: `hsl(${accentHsl})` }}>
                          R$ {tier.price_current.toFixed(2).replace('.', ',')}
                        </span>
                        {s && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-start" style={{ backgroundColor: `hsl(${accentHsl} / 0.2)`, color: `hsl(${accentHsl})` }}>
                            Economia de {s}%
                          </span>
                        )}
                        {tier.daily_renewal && tier.daily_renewal > 0 && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border mt-1 self-start" style={{ borderColor: `hsl(${primaryHsl} / 0.3)`, backgroundColor: `hsl(${primaryHsl} / 0.1)` }}>
                            <RefreshCw className="w-3 h-3" style={{ color: `hsl(${primaryHsl})` }} />
                            <span className="text-[10px] font-bold" style={{ color: `hsl(${primaryHsl})` }}>Renovação diária de {tier.daily_renewal.toLocaleString('pt-BR')} créditos/dia !</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" style={{ color: `hsl(${primaryHsl})` }} />
                    Compra Segura
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" style={{ color: `hsl(${primaryHsl})` }} />
                    Entrega Automática
                  </div>
                  <div className="flex items-center gap-1">
                    <Headphones className="w-4 h-4" style={{ color: `hsl(${primaryHsl})` }} />
                    Suporte 24h
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">O que você vai receber:</h3>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4" style={{ color: `hsl(${accentHsl})` }} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isPreview) return;
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('email') as string;
                    const whatsappVal = formData.get('whatsapp') as string;
                    const countryCodeVal = formData.get('countryCode') as string || '+55';
                    const fullWhatsapp = `${countryCodeVal.replace('+', '')}${whatsappVal.replace(/\\D/g, '')}`;
                    const whatsappMessage = encodeURIComponent(
                      `Olá! Gostaria de comprar o ${mainTier.name} (${mainTier.credits.toLocaleString('pt-BR')} créditos) por R$ ${mainTier.price_current.toFixed(2).replace('.', ',')}. Meu email: ${email}, WhatsApp: +${fullWhatsapp}`
                    );
                    window.open(`https://wa.me/${page.whatsapp_number || '5548996029392'}?text=${whatsappMessage}`, '_blank');
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      Seu Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                      required
                    />
                    <p className="text-xs text-muted-foreground">O acesso será enviado para este email</p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </label>
                    <div className="flex gap-2">
                      <select name="countryCode" defaultValue="+55" className="bg-background border border-border rounded-md px-2 py-2 text-sm text-foreground w-[100px] flex-shrink-0">
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+351">🇵🇹 +351</option>
                      </select>
                      <input
                        type="tel"
                        name="whatsapp"
                        placeholder="(00) 00000-0000"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-3 rounded-lg">
                    <LockKeyhole className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Seus dados estão protegidos • Acesso liberado automaticamente</span>
                  </div>

                  <Button type="submit" variant="hero" size="xl" className="w-full" style={{ backgroundColor: `hsl(${primaryHsl})` }}>
                    COMPRAR AGORA
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Já é cliente?{' '}
                    <a href="/auth" className="hover:underline" style={{ color: `hsl(${primaryHsl})` }}>
                      Clique aqui para acessar o painel
                    </a>
                  </p>

                  <p className="text-center text-xs text-muted-foreground">
                    Ao comprar, você concorda com nossos{' '}
                    <a href="/termos" className="hover:underline" style={{ color: `hsl(${primaryHsl})` }}>Termos de Uso</a>
                    {' '}e{' '}
                    <a href="/privacidade" className="hover:underline" style={{ color: `hsl(${primaryHsl})` }}>Política de Privacidade</a>
                  </p>

                  <div className="flex justify-center mt-4">
                    <img src={page.logo_image || '/defaults/logo.png'} alt="Logo" className="h-10 opacity-70" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      );
    },
  };
  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{
        '--dynamic-primary': primaryHsl,
        '--dynamic-accent': accentHsl,
        fontFamily: fontBody,
      } as React.CSSProperties}
    >
      <TopInfoBanner />
      {/* Fixed background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{ 
          backgroundImage: `url(${page.background_image || backgroundHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div 
        className="fixed inset-0 -z-10" 
        style={{ backgroundColor: `${page.color_background || '#0a0a0f'}e6` }}
      />

      {/* Header with Logo and Navigation - hidden in clean mode */}
      {!isClean && (
        <header className="fixed top-[36px] sm:top-[40px] left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 h-16 sm:h-20 md:h-24">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
            {page.logo_image ? (
              <img 
                src={page.logo_image} 
                alt="Logo" 
                className="object-contain"
                style={{
                  height: page.logo_size === 'small' ? '32px' :
                          page.logo_size === 'large' ? '64px' :
                          page.logo_size === 'xlarge' ? '80px' :
                          '48px' // medium (default)
                }}
              />
            ) : (
              <h1 className="font-bold text-base sm:text-lg" style={{ color: `hsl(${primaryHsl})` }}>{page.title}</h1>
            )}
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {(() => {
                const navButtons = (page.nav_buttons as { id: string; label: string; enabled: boolean; action: string; target: string }[]) || [];
                const getBtn = (id: string) => navButtons.find(b => b.id === id);
                const isEnabled = (id: string) => { const b = getBtn(id); return b ? b.enabled : true; };
                const getLabel = (id: string, fallback: string) => { const b = getBtn(id); return b?.label || fallback; };
                const getTarget = (id: string, fallback: string) => { const b = getBtn(id); return b?.target || fallback; };
                const handleNavClick = (btn: { action: string; target: string }) => {
                  if (btn.action === 'link' || btn.target.startsWith('http')) {
                    window.open(btn.target, '_blank', 'noopener,noreferrer');
                  } else if (btn.target.startsWith('#')) {
                    const el = document.getElementById(btn.target.replace('#', ''));
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                };
                return (
                  <>
                    {isEnabled('painel_gerador') && (
                      <Button variant="hero" size="sm" onClick={() => handleNavClick({ action: getBtn('painel_gerador')?.action || 'scroll', target: getTarget('painel_gerador', '#checkout') })}>
                        {getLabel('painel_gerador', 'Painel Gerador')}
                      </Button>
                    )}
                    {isEnabled('comprar_agora') && (
                      <Button size="sm" className="text-white" style={{ backgroundColor: `hsl(${primaryHsl})` }} onClick={() => {
                        const t = getTarget('comprar_agora', '');
                        if (t && (t.startsWith('http') || t.startsWith('#'))) { handleNavClick({ action: 'link', target: t }); }
                        else { openHeroCheckout(); }
                      }}>
                        {getLabel('comprar_agora', page.hero_cta_text || 'Comprar Agora')}
                      </Button>
                    )}
                    {user ? (
                      <Button variant="outline" size="sm" style={{ borderColor: `hsl(${primaryHsl} / 0.5)`, color: `hsl(${primaryHsl})` }} onClick={async () => { await supabase.auth.signOut(); setUser(null); }}>
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" style={{ borderColor: `hsl(${primaryHsl} / 0.5)`, color: `hsl(${primaryHsl})` }} onClick={() => navigate('/auth')}>
                        <UserPlus className="w-4 h-4 mr-2" /> Criar conta
                      </Button>
                    )}
                    {isEnabled('compra_creditos') && (
                      <Button variant="accent" size="sm" className="glow-accent" onClick={() => handleNavClick({ action: getBtn('compra_creditos')?.action || 'scroll', target: getTarget('compra_creditos', '#pacotes') })}>
                        {getLabel('compra_creditos', 'Compra de Créditos')}
                      </Button>
                    )}
                    {isEnabled('como_funciona') && (
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => handleNavClick({ action: getBtn('como_funciona')?.action || 'scroll', target: getTarget('como_funciona', '#how-it-works') })}>
                        {getLabel('como_funciona', 'Como Funciona')}
                      </Button>
                    )}
                    {isEnabled('faq') && (
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => handleNavClick({ action: getBtn('faq')?.action || 'scroll', target: getTarget('faq', '#faq') })}>
                        {getLabel('faq', 'FAQ')}
                      </Button>
                    )}
                  </>
                );
              })()}
            </nav>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border w-[280px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {(() => {
                    const navButtons = (page.nav_buttons as { id: string; label: string; enabled: boolean; action: string; target: string }[]) || [];
                    const getBtn = (id: string) => navButtons.find(b => b.id === id);
                    const isEnabled = (id: string) => { const b = getBtn(id); return b ? b.enabled : true; };
                    const getLabel = (id: string, fallback: string) => { const b = getBtn(id); return b?.label || fallback; };
                    const getTarget = (id: string, fallback: string) => { const b = getBtn(id); return b?.target || fallback; };
                    const handleNavClick = (btn: { action: string; target: string }) => {
                      if (btn.action === 'link' || btn.target.startsWith('http')) {
                        window.open(btn.target, '_blank', 'noopener,noreferrer');
                      } else if (btn.target.startsWith('#')) {
                        const el = document.getElementById(btn.target.replace('#', ''));
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }
                    };
                    return (
                      <>
                        {isEnabled('painel_gerador') && (
                          <Button variant="hero" className="w-full" onClick={() => handleNavClick({ action: getBtn('painel_gerador')?.action || 'scroll', target: getTarget('painel_gerador', '#checkout') })}>
                            {getLabel('painel_gerador', 'Painel Gerador')}
                          </Button>
                        )}
                        {isEnabled('comprar_agora') && (
                          <Button className="w-full text-white" style={{ backgroundColor: `hsl(${primaryHsl})` }} onClick={() => {
                            const t = getTarget('comprar_agora', '');
                            if (t && (t.startsWith('http') || t.startsWith('#'))) { handleNavClick({ action: 'link', target: t }); }
                            else { openHeroCheckout(); }
                          }}>
                            {getLabel('comprar_agora', page.hero_cta_text || 'Comprar Agora')}
                          </Button>
                        )}
                        {user ? (
                          <Button variant="outline" className="w-full" style={{ borderColor: `hsl(${primaryHsl} / 0.5)`, color: `hsl(${primaryHsl})` }} onClick={async () => { await supabase.auth.signOut(); setUser(null); }}>
                            <LogOut className="w-4 h-4 mr-2" /> Sair
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" style={{ borderColor: `hsl(${primaryHsl} / 0.5)`, color: `hsl(${primaryHsl})` }} onClick={() => navigate('/auth')}>
                            <UserPlus className="w-4 h-4 mr-2" /> Criar conta
                          </Button>
                        )}
                        {isEnabled('compra_creditos') && (
                          <Button variant="accent" className="w-full glow-accent" onClick={() => handleNavClick({ action: getBtn('compra_creditos')?.action || 'scroll', target: getTarget('compra_creditos', '#pacotes') })}>
                            {getLabel('compra_creditos', 'Compra de Créditos')}
                          </Button>
                        )}
                        {isEnabled('como_funciona') && (
                          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => handleNavClick({ action: getBtn('como_funciona')?.action || 'scroll', target: getTarget('como_funciona', '#how-it-works') })}>
                            {getLabel('como_funciona', 'Como Funciona')}
                          </Button>
                        )}
                        {isEnabled('faq') && (
                          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => handleNavClick({ action: getBtn('faq')?.action || 'scroll', target: getTarget('faq', '#faq') })}>
                            {getLabel('faq', 'FAQ')}
                          </Button>
                        )}
                      </>
                    );
                  })()}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      )}

      {/* Render sections in the configured order */}
      {sectionOrder.map((sectionId) => {
        const content = sectionRenderers[sectionId]?.();
        if (!content) return null;
        if (!isPreview || sectionId === 'hero') return content;
        return (
          <div key={`wrapper-${sectionId}`} className="relative">
            <SectionDeleteButton section={sectionId} />
            {content}
          </div>
        );
      })}

      {/* Access Key Section (always at the end if exists) */}
      {page.access_key && (
        <section className="py-8 px-4 border-t border-border/30">
          <div className="max-w-xl mx-auto text-center">
            <div 
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: `hsl(${accentHsl} / 0.1)`,
                borderColor: `hsl(${accentHsl} / 0.3)`
              }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: fontHeading }}>🔑 Chave de Acesso</h3>
              <p 
                className="text-2xl font-bold font-mono cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: `hsl(${accentHsl})` }}
                onClick={() => {
                  navigator.clipboard.writeText(page.access_key || '');
                }}
                title="Clique para copiar"
              >
                {page.access_key}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Clique para copiar a chave</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm space-y-4">
          <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
          
          {/* Version and Update Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-border/20">
            <span className="text-xs">
              Versão: <span className="font-semibold text-foreground">{APP_VERSION}</span>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-xs">
              Atualizado em: <span className="font-semibold text-foreground">{LAST_UPDATE}</span>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-xs">
              Agora: <span className="font-semibold text-foreground">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
          </div>
          
          {/* Clear Cache Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Limpar Cache e Atualizar
          </Button>
        </div>
      </footer>

      {/* Social Proof Notification */}
      <SocialProofNotification 
        enabled={page.social_proof_enabled ?? true}
        productName={page.social_proof_product_name || 'o Gerador'}
        customers={(page.social_proof_customers as { name: string; city: string; state: string }[]) || undefined}
        creditOptions={(page.social_proof_credits as number[]) || undefined}
      />
      
      {/* WhatsApp Button */}
      <WhatsAppButton number={page.whatsapp_number || undefined} message={page.whatsapp_message || undefined} />
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => {
          setCheckoutModalOpen(false);
          setSelectedTier(null);
        }}
        tier={selectedTier}
        landingPageId={page.id}
        primaryColor={page.color_primary || '#8B5CF6'}
        accentColor={page.color_accent || '#22C55E'}
        showBalance={page.checkout_show_balance ?? true}
        balanceLabel={page.checkout_balance_label || 'Seu saldo:'}
        securityText={page.checkout_security_text || 'Pagamento 100% seguro'}
        inviteEnabled={page.checkout_invite_enabled ?? true}
        inviteLabel={page.checkout_invite_label || 'Link de Convite'}
        invitePlaceholder={page.checkout_invite_placeholder || 'https://lovable.dev/invite/...'}
        couponEnabled={page.checkout_coupon_enabled ?? true}
        couponLabel={page.checkout_coupon_label || 'Cupom de Desconto'}
        buttonText={page.checkout_button_text || 'Continuar para Pagamento'}
        whatsappNumber={page.whatsapp_number || ''}
        whatsappMessage={page.checkout_whatsapp_message || ''}
        pixEnabled={(page as any).pix_enabled ?? false}
        pixKey={(page as any).pix_key || ''}
        pixName={(page as any).pix_name || ''}
        pixQrBase={(page as any).pix_qr_base || ''}
      />
      <PanelCheckoutModal open={panelCheckoutOpen} onClose={() => setPanelCheckoutOpen(false)} customPrice={page.price_current || undefined} customOriginalPrice={page.price_original || undefined} />
      <ResellerValuesModal open={showReseller} onOpenChange={setShowReseller} />
    </div>
  );
};

const DynamicLandingPage = () => (
  <DynamicLandingPageErrorBoundary>
    <DynamicLandingPageInner />
  </DynamicLandingPageErrorBoundary>
);

export default DynamicLandingPage;
