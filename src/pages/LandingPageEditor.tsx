import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getLandingPageUrl, getDisplayUrl } from '@/lib/urls';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, ExternalLink, Sparkles, Plus, Trash2, Eye, EyeOff, GripVertical, Check, RefreshCw, HelpCircle, Menu, MessageCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';
import { EditorTour, triggerEditorTour } from '@/components/EditorTour';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { SectionOrderManager, SectionId, defaultSectionOrder } from '@/components/SectionOrderManager';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import backgroundHero from '@/assets/background-hero.png';
import logoPainel from '@/assets/logo-dashboard.png';

interface LandingPageData {
  id?: string;
  slug: string;
  title: string;
  is_published: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image: string;
  product_image: string;
  background_image: string;
  logo_image: string;
  logo_size: 'small' | 'medium' | 'large' | 'xlarge';
  price_original: number | null;
  price_current: number | null;
  price_installments: number;
  about_title: string;
  about_description: string;
  cta_title: string;
  cta_subtitle: string;
  color_primary: string;
  color_accent: string;
  color_background: string;
  color_text: string;
  color_text_highlight: string;
  color_icons: string;
  font_heading: string;
  font_body: string;
  video_enabled: boolean;
  video_title: string;
  video_url: string;
  video_thumbnail: string;
  video_hide_controls: boolean;
  donation_enabled: boolean;
  donation_title: string;
  donation_description: string;
  donation_pix_key: string;
  donation_pix_name: string;
  donation_qr_code: string;
  access_key: string;
  whatsapp_number: string;
  whatsapp_message: string;
  features: { title: string; description: string; icon?: string }[];
  how_it_works: { step: number; title: string; description: string; image?: string }[];
  testimonials: { name: string; text: string; rating: number; avatar?: string }[];
  faqs: { question: string; answer: string }[];
  secure_purchase_items: { title: string; description: string; icon?: string }[];
  pricing_tiers: { id: string; name: string; credits: number; bonus_credits?: number; daily_renewal?: number; price_original: number; price_current: number; available: number; sales: number; checkout_link: string; highlight?: boolean }[];
  custom_package_options: { credits: number; price: number; bonus_credits?: number }[];
  social_proof_enabled: boolean;
  social_proof_product_name: string;
  social_proof_customers: { name: string; city: string; state: string }[];
  social_proof_credits: number[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  facebook_pixel: string;
  google_analytics: string;
  google_tag_manager: string;
  tiktok_pixel: string;
  section_order: SectionId[];
  // Checkout configuration
  checkout_show_balance: boolean;
  checkout_balance_label: string;
  checkout_security_text: string;
  checkout_invite_enabled: boolean;
  checkout_invite_label: string;
  checkout_invite_placeholder: string;
  checkout_coupon_enabled: boolean;
  checkout_coupon_label: string;
  checkout_button_text: string;
  checkout_whatsapp_message: string;
  // PIX payment configuration
  pix_enabled: boolean;
  pix_key: string;
  pix_name: string;
  pix_qr_base: string;
  // Hero advanced fields
  hero_title_highlight: string;
  hero_badge_text: string;
  hero_daily_renewal_text: string;
  hero_extra_prices: { price_original: number; price_current: number; label?: string }[];
  hero_extra_renewals: { text: string }[];
  // Promo banner
  promo_text: string;
  promo_link: string;
  why_choose_items: string[];
  // Checkout page fields
  checkout_product_subtitle: string;
  checkout_product_description: string;
  checkout_badge_text: string;
  checkout_benefits: string[];
  checkout_enabled: boolean;
  nav_buttons: { id: string; label: string; enabled: boolean; action: string; target: string }[];
}

const fontOptions = [
  { name: 'Inter', value: 'Inter', style: 'font-sans' },
  { name: 'Poppins', value: 'Poppins', style: 'font-sans' },
  { name: 'Montserrat', value: 'Montserrat', style: 'font-sans' },
  { name: 'Roboto', value: 'Roboto', style: 'font-sans' },
  { name: 'Open Sans', value: 'Open Sans', style: 'font-sans' },
  { name: 'Playfair Display', value: 'Playfair Display', style: 'font-serif' },
  { name: 'Lora', value: 'Lora', style: 'font-serif' },
  { name: 'Merriweather', value: 'Merriweather', style: 'font-serif' },
  { name: 'Oswald', value: 'Oswald', style: 'font-sans' },
  { name: 'Raleway', value: 'Raleway', style: 'font-sans' },
  { name: 'Bebas Neue', value: 'Bebas Neue', style: 'font-sans' },
  { name: 'Anton', value: 'Anton', style: 'font-sans' },
  { name: 'Space Grotesk', value: 'Space Grotesk', style: 'font-sans' },
  { name: 'DM Sans', value: 'DM Sans', style: 'font-sans' },
  { name: 'Outfit', value: 'Outfit', style: 'font-sans' },
];

const colorPalettes = [
  { name: 'Roxo & Verde', primary: '#8B5CF6', accent: '#10B981', background: '#0a0a0f' },
  { name: 'Azul & Laranja', primary: '#3B82F6', accent: '#F97316', background: '#0a0a0f' },
  { name: 'Rosa & Azul', primary: '#EC4899', accent: '#06B6D4', background: '#0a0a0f' },
  { name: 'Verde & Amarelo', primary: '#22C55E', accent: '#EAB308', background: '#0a0a0f' },
  { name: 'Vermelho & Dourado', primary: '#EF4444', accent: '#F59E0B', background: '#0a0a0f' },
  { name: 'Ciano & Magenta', primary: '#06B6D4', accent: '#D946EF', background: '#0a0a0f' },
];

const defaultData: LandingPageData = {
  slug: '',
  title: 'Nova Landing Page',
  is_published: false,
  hero_title: 'Créditos Infinitos na Lovable. Simples. Rápido. Automático.',
  hero_subtitle: 'Use nosso painel exclusivo e gere créditos ilimitados para seus projetos Lovable e revenda créditos.',
  hero_cta_text: 'Comprar Agora',
  hero_cta_link: '',
  hero_image: '/defaults/hero.png',
  product_image: '/defaults/product.png',
  background_image: '/defaults/background.png',
  logo_image: '/defaults/logo.png',
  logo_size: 'medium' as const,
  price_original: 150,
  price_current: 99.99,
  price_installments: 12,
  about_title: 'O que é o Painel?',
  about_description: 'Uma ferramenta automatizada que gera créditos para sua conta Lovable de forma simples e rápida.',
  cta_title: 'Não perca essa oportunidade!',
  cta_subtitle: 'Garanta seu acesso agora mesmo com desconto exclusivo',
  color_primary: '#8B5CF6',
  color_accent: '#10B981',
  color_background: '#0a0a0f',
  color_text: '#ffffff',
  color_text_highlight: '#a855f7',
  color_icons: '#8B5CF6',
  font_heading: 'Inter',
  font_body: 'Inter',
  video_enabled: true,
  video_title: '🎬 Como Funciona',
  video_url: 'https://www.youtube.com/watch?v=2y0v-XQyPoM',
  video_thumbnail: '/defaults/video-thumbnail.jpg',
  video_hide_controls: true,
  donation_enabled: true,
  donation_title: '💚 Apoie o Desenvolvedor',
  donation_description: 'Gostou do sistema? Considere fazer uma doação via PIX para ajudar no desenvolvimento!',
  donation_pix_key: '48996029392',
  donation_pix_name: 'Marcondes Jorge Machado',
  donation_qr_code: '',
  access_key: '',
  whatsapp_number: '5548996029392',
  whatsapp_message: 'Olá! Gostaria de mais informações sobre o painel.',
  features: [
    { title: 'Interface Simples', description: 'Painel intuitivo, sem complicações. Qualquer pessoa consegue usar.' },
    { title: '100% Automatizado', description: 'O sistema faz todo o trabalho. Você só precisa clicar.' },
    { title: 'Créditos Ilimitados', description: 'Gere quantos créditos precisar, sem limites ou restrições.' },
  ],
  how_it_works: [
    { step: 1, title: 'Compre o Acesso', description: 'Pagamento rápido e seguro. Acesso liberado na hora.' },
    { step: 2, title: 'Entre no Painel', description: 'Receba suas credenciais e acesse a plataforma.' },
    { step: 3, title: 'Gere Créditos', description: 'Com poucos cliques, seus créditos são gerados automaticamente.' },
    { step: 4, title: 'Use na Lovable', description: 'Aproveite seus créditos e crie projetos sem limites.' },
  ],
  testimonials: [
    { name: 'Carlos M.', text: 'Consegui mais de 500 créditos em uma semana! O painel é muito fácil de usar.', rating: 5 },
    { name: 'Ana Paula S.', text: 'Melhor investimento que fiz. O suporte é excelente e os créditos chegam rápido.', rating: 5 },
    { name: 'Roberto F.', text: 'Estava cético no início, mas funcionou perfeitamente. Recomendo a todos!', rating: 5 },
  ],
  faqs: [
    { question: 'Como funciona para gerar os créditos?', answer: 'É bem simples! Tudo feito pelo workspace, enviaremos um email após o pagamento e um vídeo ensinando pelo WhatsApp.' },
    { question: 'Como eu sei se funciona mesmo e não é golpe?', answer: 'Você pode pedir para nós enviarmos créditos para você para que você veja os resultados e o funcionamento por conta própria. Clique aqui para pedir uma demonstração.' },
    { question: 'Está funcionando depois da atualização do Lovable?', answer: 'Método atualizado em 02/04/2026.' },
    { question: 'Funciona em uma conta que já indicou mais de 10 convites?', answer: 'Sim! Você pode resgatar créditos em uma conta que já indicou mais de 10 pessoas, desde que você tenha acesso a uma conta que já resgatou créditos nessa conta, então você pode depositar na conta desejada.' },
  ],
  secure_purchase_items: [
    { title: 'Produto Testado', description: 'Ferramenta validada e funcionando perfeitamente.', icon: 'Shield' },
    { title: 'Entrega Automática', description: 'Receba acesso imediato após a confirmação do pagamento.', icon: 'Zap' },
    { title: 'Suporte Disponível', description: 'Equipe pronta para ajudar sempre que precisar.', icon: 'Headphones' },
    { title: 'Atualizações Gratuitas', description: 'Melhorias constantes sem custo adicional.', icon: 'RefreshCw' },
  ],
  pricing_tiers: [
    {
      id: 'tier-1k',
      name: '1k de créditos',
      credits: 1000,
      price_original: 297,
      price_current: 97,
      available: 10,
      sales: 50,
      highlight: true,
      checkout_link: ''
    },
    {
      id: 'tier-5k',
      name: '5k de créditos',
      credits: 5000,
      price_original: 297,
      price_current: 197,
      available: 10,
      sales: 30,
      highlight: false,
      checkout_link: ''
    }
  ],
  social_proof_enabled: true,
  why_choose_items: [
    'Créditos ilimitados para seus projetos',
    'Interface simples e intuitiva',
    'Uso imediato após a compra',
    'Não exige conhecimento técnico',
    'Ideal para quem usa Lovable com frequência',
    'Funciona 24 horas por dia',
    'Atualizações gratuitas incluídas',
    'Suporte via chat disponível',
  ],
  social_proof_product_name: 'o Gerador',
  social_proof_customers: [
    { name: 'Carlos M.', city: 'São Paulo', state: 'SP' },
    { name: 'Ana Paula S.', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Roberto F.', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Juliana C.', city: 'Curitiba', state: 'PR' },
    { name: 'Fernando L.', city: 'Salvador', state: 'BA' },
    { name: 'Mariana R.', city: 'Brasília', state: 'DF' },
    { name: 'Pedro H.', city: 'Porto Alegre', state: 'RS' },
    { name: 'Thiago N.', city: 'Florianópolis', state: 'SC' },
  ],
  social_proof_credits: [200, 500, 1000, 2000],
  meta_title: '',
  meta_description: '',
  og_image: '',
  facebook_pixel: '',
  google_analytics: '',
  google_tag_manager: '',
  tiktok_pixel: '',
  section_order: defaultSectionOrder,
  // Checkout configuration
  checkout_show_balance: true,
  checkout_balance_label: 'Seu saldo:',
  checkout_security_text: 'Pagamento 100% seguro',
  checkout_invite_enabled: true,
  checkout_invite_label: 'Link de Convite',
  checkout_invite_placeholder: 'https://lovable.dev/invite/...',
  checkout_coupon_enabled: true,
  checkout_coupon_label: 'Cupom de Desconto',
  checkout_button_text: 'Continuar para Pagamento',
  checkout_whatsapp_message: `🛒 *NOVO PEDIDO*

📦 *Pacote:* {pacote}
💳 *Créditos:* {creditos}
💰 *Valor:* {valor}

👤 *Cliente:*
• Nome: {nome}
• WhatsApp: {whatsapp}
• Email: {email}

{link_convite}
{cupom}

📅 *Data:* {data}`,
  // PIX payment configuration
  pix_enabled: true,
  pix_key: '',
  pix_name: '',
  pix_qr_base: '',
  // Hero advanced fields
  hero_title_highlight: '',
  hero_badge_text: 'Oferta Limitada',
  hero_daily_renewal_text: '',
  hero_extra_prices: [],
  hero_extra_renewals: [],
  promo_text: '🔥 Temos contas antigas com 10k por R$215',
  promo_link: '',
  custom_package_options: [],
  // Checkout page fields
  checkout_product_subtitle: 'Acesso Completo',
  checkout_product_description: 'Acesso vitalício • Sem mensalidades',
  checkout_badge_text: 'OFERTA LIMITADA',
  checkout_benefits: ['Acesso ao Painel', 'Gerador de Créditos Ilimitado', 'Suporte Premium 24/7', 'Atualizações Gratuitas', 'Comunidade Exclusiva'],
  checkout_enabled: true,
  nav_buttons: [
    { id: 'painel_gerador', label: 'Painel Gerador', enabled: true, action: 'scroll', target: '#checkout' },
    { id: 'comprar_agora', label: 'Comprar Agora', enabled: true, action: 'cta', target: '' },
    { id: 'compra_creditos', label: 'Compra de Créditos', enabled: true, action: 'scroll', target: '#pacotes' },
    { id: 'como_funciona', label: 'Como Funciona', enabled: true, action: 'scroll', target: '#how-it-works' },
    { id: 'faq', label: 'FAQ', enabled: true, action: 'scroll', target: '#faq' },
  ],
};

const LandingPageEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<LandingPageData>(defaultData);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState('basico');
  const [creatingDraft, setCreatingDraft] = useState(false);
  const draftCreatedRef = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const [previewMounted, setPreviewMounted] = useState(true);

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  // Hard reset: desmonta o iframe completamente e remonta após um tick
  const recreatePreview = useCallback(() => {
    setPreviewMounted(false);
    // Aguarda o próximo frame para garantir que o iframe foi removido do DOM
    requestAnimationFrame(() => {
      setPreviewKey(prev => prev + 1);
      setPreviewMounted(true);
      toast.success('Preview recriado');
    });
  }, []);

  // Panel size persistence
  const PANEL_SIZE_KEY = 'editor-panel-sizes';
  const getStoredPanelSizes = (): number[] | undefined => {
    try {
      const stored = localStorage.getItem(PANEL_SIZE_KEY);
      if (stored) {
        const sizes = JSON.parse(stored);
        if (Array.isArray(sizes) && sizes.length === 2) {
          return sizes;
        }
      }
    } catch {
      // ignore parse errors
    }
    return undefined;
  };
  const storedSizes = getStoredPanelSizes();
  const defaultEditorSize = storedSizes?.[0] ?? 40;
  const defaultPreviewSize = storedSizes?.[1] ?? 60;

  const handlePanelResize = (sizes: number[]) => {
    try {
      localStorage.setItem(PANEL_SIZE_KEY, JSON.stringify(sizes));
    } catch {
      // ignore storage errors
    }
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const buildPayload = (draft: LandingPageData) => ({
    user_id: user?.id,
    slug: draft.slug,
    title: draft.title,
    is_published: draft.is_published,
    hero_title: draft.hero_title || null,
    hero_subtitle: draft.hero_subtitle || null,
    hero_cta_text: draft.hero_cta_text || 'Comprar Agora',
    hero_cta_link: draft.hero_cta_link || null,
    hero_image: draft.hero_image || null,
    product_image: draft.product_image || null,
    background_image: draft.background_image || null,
    logo_image: draft.logo_image || null,
    logo_size: draft.logo_size || 'medium',
    price_original: draft.price_original,
    price_current: draft.price_current,
    price_installments: draft.price_installments,
    about_title: draft.about_title || null,
    about_description: draft.about_description || null,
    cta_title: draft.cta_title || null,
    cta_subtitle: draft.cta_subtitle || null,
    color_primary: draft.color_primary || '#8B5CF6',
    color_accent: draft.color_accent || '#10B981',
    color_background: draft.color_background || '#0a0a0f',
    color_text: draft.color_text || '#ffffff',
    color_text_highlight: draft.color_text_highlight || '#a855f7',
    color_icons: draft.color_icons || '#8B5CF6',
    font_heading: draft.font_heading || 'Inter',
    font_body: draft.font_body || 'Inter',
    video_enabled: draft.video_enabled,
    video_title: draft.video_title || null,
    video_url: draft.video_url || null,
    video_thumbnail: draft.video_thumbnail || null,
    video_hide_controls: draft.video_hide_controls,
    donation_enabled: draft.donation_enabled,
    donation_title: draft.donation_title || null,
    donation_description: draft.donation_description || null,
    donation_pix_key: draft.donation_pix_key || null,
    donation_pix_name: draft.donation_pix_name || null,
    donation_qr_code: draft.donation_qr_code || null,
    access_key: draft.access_key || null,
    whatsapp_number: draft.whatsapp_number || null,
    whatsapp_message: draft.whatsapp_message || null,
    features: draft.features,
    how_it_works: draft.how_it_works,
    testimonials: draft.testimonials,
    faqs: draft.faqs,
    secure_purchase_items: draft.secure_purchase_items,
    pricing_tiers: draft.pricing_tiers,
    social_proof_enabled: draft.social_proof_enabled,
    social_proof_product_name: draft.social_proof_product_name || 'o Gerador',
    social_proof_customers: draft.social_proof_customers,
    social_proof_credits: draft.social_proof_credits || [200, 500, 1000, 2000],
    meta_title: draft.meta_title || null,
    meta_description: draft.meta_description || null,
    og_image: draft.og_image || null,
    facebook_pixel: draft.facebook_pixel || null,
    google_analytics: draft.google_analytics || null,
    google_tag_manager: draft.google_tag_manager || null,
    tiktok_pixel: draft.tiktok_pixel || null,
    section_order: draft.section_order.includes('donation') ? draft.section_order : [...draft.section_order, 'donation'],
    // PIX payment configuration
    pix_enabled: draft.pix_enabled ?? true,
    pix_key: draft.pix_key || null,
    pix_name: draft.pix_name || null,
    pix_qr_base: draft.pix_qr_base || null,
    // Hero advanced fields
    hero_title_highlight: draft.hero_title_highlight || null,
    hero_badge_text: draft.hero_badge_text || 'Oferta Limitada',
    hero_daily_renewal_text: draft.hero_daily_renewal_text || null,
    hero_extra_prices: draft.hero_extra_prices || [],
    hero_extra_renewals: draft.hero_extra_renewals || [],
    promo_text: draft.promo_text || null,
    promo_link: draft.promo_link || null,
    custom_package_options: draft.custom_package_options || [],
    why_choose_items: draft.why_choose_items || [],
    checkout_product_subtitle: draft.checkout_product_subtitle || null,
    checkout_product_description: draft.checkout_product_description || null,
    checkout_badge_text: draft.checkout_badge_text || 'OFERTA LIMITADA',
    checkout_benefits: draft.checkout_benefits || [],
    checkout_enabled: draft.checkout_enabled ?? true,
    checkout_show_balance: draft.checkout_show_balance ?? true,
    checkout_balance_label: draft.checkout_balance_label || 'Seu saldo:',
    checkout_security_text: draft.checkout_security_text || 'Pagamento 100% seguro',
    checkout_invite_enabled: draft.checkout_invite_enabled ?? true,
    checkout_invite_label: draft.checkout_invite_label || 'Link de Convite',
    checkout_invite_placeholder: draft.checkout_invite_placeholder || 'https://lovable.dev/invite/...',
    checkout_coupon_enabled: draft.checkout_coupon_enabled ?? true,
    checkout_coupon_label: draft.checkout_coupon_label || 'Cupom de Desconto',
    checkout_button_text: draft.checkout_button_text || 'Continuar para Pagamento',
    checkout_whatsapp_message: draft.checkout_whatsapp_message || null,
    nav_buttons: draft.nav_buttons || defaultData.nav_buttons,
  });

  // Auto-save function with debounce
  const autoSave = useCallback(async () => {
    if (!user || !data.id || saving || autoSaving || creatingDraft) return;
    
    setAutoSaving(true);
    try {
      const payload = buildPayload(data);
      const { error } = await supabase
        .from('landing_pages')
        .update(payload)
        .eq('id', data.id);
      
      if (!error) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [user, data, saving, autoSaving, creatingDraft]);

  // Auto-save when data changes (with debounce)
  useEffect(() => {
    // Skip initial load
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    
    // Skip if not editing an existing page
    if (!data.id) return;
    
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (1.5 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Map from tab to section for scrolling preview
  const tabToSectionMap: Record<string, string> = {
    'basico': 'hero',
    'layout': 'hero',
    'imagens': 'hero',
    'video': 'video',
    'precos': 'cta',
    'sobre': 'about',
    'doacao': 'donation',
    'compra-segura': 'secure-purchase',
    'conteudo': 'features',
    'depoimentos': 'testimonials',
    'faq': 'faq',
    'seo': 'hero',
  };

  // When tab changes, scroll preview to corresponding section
  useEffect(() => {
    const section = tabToSectionMap[activeTab];
    if (section && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'scroll-to-section', section }, '*');
    }
  }, [activeTab]);

  // Listen for hover and click messages from preview iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const sectionMap: Record<string, string> = {
        'hero': 'basico',
        'pricing': 'precos',
        'pacotes': 'pacotes',
        'features': 'conteudo',
        'about': 'sobre',
        'how-it-works': 'conteudo',
        'secure-purchase': 'compra-segura',
        'testimonials': 'depoimentos',
        'faq': 'faq',
        'cta': 'precos',
        'images': 'imagens',
        'donation': 'doacao',
      };
      
      // NOTE: We intentionally ignore hover messages to avoid UI thrash/flicker in the preview.
      if (event.data?.type === 'section-click') {
        const tab = sectionMap[event.data.section];
        if (tab) {
          setActiveTab(tab);
        }
      }

      if (event.data?.type === 'section-delete') {
        const sectionId = event.data.section as SectionId;
        if (sectionId === 'hero' || sectionId === 'donation') return; // Protected sections
        const newOrder = data.section_order.filter(s => s !== sectionId);
        const newData = { ...data, section_order: newOrder };
        setData(newData);
        if (data.id) {
          try {
            const payload = buildPayload(newData);
            await supabase.from('landing_pages').update(payload).eq('id', data.id);
            setLastSaved(new Date());
            refreshPreview();
            toast.success(`Seção removida com sucesso`);
          } catch (e) {
            console.error('Delete section error:', e);
            toast.error('Erro ao remover seção');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [data]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isEditing && user) {
      fetchPage();
    }
  }, [id, user]);

  // Auto-cria um rascunho ao abrir /dashboard/new para o preview funcionar imediatamente
  useEffect(() => {
    const ensureDraft = async () => {
      if (authLoading) return;
      if (!user) return;
      if (isEditing) return;
      if (!showPreview) return;
      if (draftCreatedRef.current) return;

      draftCreatedRef.current = true;
      setCreatingDraft(true);

      try {
        // Gera um slug único para evitar colisões
        const base = slugify(data.title || 'nova-landing-page') || 'nova-landing-page';
        const suffix = String(Date.now()).slice(-5);
        const nextSlug = `${base}-${suffix}`;

        const draft: LandingPageData = { ...data, slug: nextSlug, is_published: false };
        setData(draft);

        const { data: created, error } = await supabase
          .from('landing_pages')
          .insert([buildPayload(draft)])
          .select('id')
          .single();

        if (error) throw error;
        if (created?.id) {
          setData((prev) => ({ ...prev, id: created.id }));
          navigate(`/dashboard/edit/${created.id}`, { replace: true });
        }
      } catch (error) {
        console.error('Error creating draft page:', error);
        // Se der erro, deixamos o usuário continuar manualmente (sem travar)
      } finally {
        setCreatingDraft(false);
      }
    };

    ensureDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isEditing, showPreview]);

  const fetchPage = async () => {
    try {
      const { data: page, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setData({
        ...page,
        hero_title: page.hero_title || '',
        hero_subtitle: page.hero_subtitle || '',
        hero_cta_text: page.hero_cta_text || 'Comprar Agora',
        hero_cta_link: page.hero_cta_link || '',
        hero_image: page.hero_image || '',
        product_image: page.product_image || '',
        background_image: page.background_image || '',
        logo_image: page.logo_image || '',
        logo_size: (page.logo_size as 'small' | 'medium' | 'large' | 'xlarge') || 'medium',
        about_title: page.about_title || '',
        about_description: page.about_description || '',
        cta_title: page.cta_title || 'Pronto para começar?',
        cta_subtitle: page.cta_subtitle || 'Garanta seu acesso agora e transforme seus resultados',
        color_primary: page.color_primary || '#8B5CF6',
        color_accent: page.color_accent || '#10B981',
        color_background: page.color_background || '#0a0a0f',
        font_heading: page.font_heading || 'Inter',
        font_body: page.font_body || 'Inter',
        donation_enabled: page.donation_enabled ?? true,
        donation_title: page.donation_title || '💚 Apoie o Desenvolvedor',
        donation_description: page.donation_description || 'Gostou do sistema? Considere fazer uma doação via PIX para ajudar no desenvolvimento!',
        donation_pix_key: page.donation_pix_key || '48996029392',
        donation_pix_name: page.donation_pix_name || 'Marcondes Jorge Machado',
        donation_qr_code: page.donation_qr_code || '',
        access_key: page.access_key || '',
        whatsapp_number: (page as any).whatsapp_number || '',
        whatsapp_message: (page as any).whatsapp_message || 'Olá! Gostaria de mais informações.',
        features: (page.features as { title: string; description: string; icon?: string }[]) || [],
        how_it_works: (page.how_it_works as { step: number; title: string; description: string; image?: string }[]) || [],
        testimonials: (page.testimonials as { name: string; text: string; rating: number; avatar?: string }[]) || [],
        faqs: (page.faqs as { question: string; answer: string }[]) || [],
        secure_purchase_items: (page.secure_purchase_items as { title: string; description: string; icon?: string }[]) || defaultData.secure_purchase_items,
        pricing_tiers: (page.pricing_tiers as { id: string; name: string; credits: number; bonus_credits?: number; daily_renewal?: number; price_original: number; price_current: number; available: number; sales: number; checkout_link: string; highlight?: boolean }[]) || [],
        custom_package_options: ((page as any).custom_package_options as { credits: number; price: number; bonus_credits?: number }[]) || [],
        social_proof_enabled: page.social_proof_enabled ?? true,
        social_proof_product_name: page.social_proof_product_name || 'o Gerador',
        social_proof_customers: (page.social_proof_customers as { name: string; city: string; state: string }[]) || defaultData.social_proof_customers,
        social_proof_credits: (page.social_proof_credits as number[]) || [200, 500, 1000, 2000],
        price_original: page.price_original ? Number(page.price_original) : null,
        price_current: page.price_current ? Number(page.price_current) : null,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        og_image: page.og_image || '',
        facebook_pixel: (page as any).facebook_pixel || '',
        google_analytics: (page as any).google_analytics || '',
        google_tag_manager: (page as any).google_tag_manager || '',
        tiktok_pixel: (page as any).tiktok_pixel || '',
        section_order: (page.section_order as SectionId[]) || defaultSectionOrder,
        hero_title_highlight: (page as any).hero_title_highlight || '',
        hero_badge_text: (page as any).hero_badge_text || 'Oferta Limitada',
        hero_daily_renewal_text: (page as any).hero_daily_renewal_text || '',
        hero_extra_prices: ((page as any).hero_extra_prices as { price_original: number; price_current: number; label?: string }[]) || [],
        hero_extra_renewals: ((page as any).hero_extra_renewals as { text: string }[]) || [],
        promo_text: (page as any).promo_text || '',
        promo_link: (page as any).promo_link || '',
        why_choose_items: ((page as any).why_choose_items as string[]) || defaultData.why_choose_items,
        checkout_product_subtitle: (page as any).checkout_product_subtitle || defaultData.checkout_product_subtitle,
        checkout_product_description: (page as any).checkout_product_description || defaultData.checkout_product_description,
        checkout_badge_text: (page as any).checkout_badge_text || defaultData.checkout_badge_text,
        checkout_benefits: ((page as any).checkout_benefits as string[]) || defaultData.checkout_benefits,
        checkout_enabled: (page as any).checkout_enabled ?? true,
        nav_buttons: ((page as any).nav_buttons as { id: string; label: string; enabled: boolean; action: string; target: string }[]) || defaultData.nav_buttons,
      });
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Erro ao carregar página');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setData({ ...data, slug });
  };

  const handleSave = async () => {
    if (!data.slug) {
      toast.error('URL amigável é obrigatória');
      return;
    }
    if (!data.title) {
      toast.error('Título é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(data);

      if (isEditing) {
        const { error } = await supabase
          .from('landing_pages')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('landing_pages').insert([payload]);
        if (error) {
          if (error.message.includes('duplicate key')) {
            toast.error('Esta URL já está em uso');
            return;
          }
          throw error;
        }
      }

      toast.success(isEditing ? 'Página atualizada!' : 'Página criada!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Erro ao salvar página');
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = useMemo(() => {
    if (!data.slug) return null;
    const draftId = id || data.id;
    const qs = new URLSearchParams();
    qs.set('preview', 'true');
    if (draftId) qs.set('draftId', draftId);
    return `/p/${data.slug}?${qs.toString()}`;
  }, [data.slug, data.id, id]);

  const addFeature = () => {
    setData({
      ...data,
      features: [...data.features, { title: '', description: '', icon: '' }]
    });
  };

  const removeFeature = (index: number) => {
    setData({
      ...data,
      features: data.features.filter((_, i) => i !== index)
    });
  };

  const addStep = () => {
    setData({
      ...data,
      how_it_works: [...data.how_it_works, { step: data.how_it_works.length + 1, title: '', description: '', image: '' }]
    });
  };

  const removeStep = (index: number) => {
    setData({
      ...data,
      how_it_works: data.how_it_works.filter((_, i) => i !== index)
    });
  };

  const addTestimonial = () => {
    setData({
      ...data,
      testimonials: [...data.testimonials, { name: '', text: '', rating: 5, avatar: '' }]
    });
  };

  const removeTestimonial = (index: number) => {
    setData({
      ...data,
      testimonials: data.testimonials.filter((_, i) => i !== index)
    });
  };

  const addFaq = () => {
    setData({
      ...data,
      faqs: [...(data.faqs || []), { question: '', answer: '' }]
    });
  };

  const removeFaq = (index: number) => {
    setData({
      ...data,
      faqs: (data.faqs || []).filter((_, i) => i !== index)
    });
  };

  const addPricingTier = () => {
    const newTier = {
      id: crypto.randomUUID(),
      name: 'Pacote Iniciante',
      credits: 1000,
      bonus_credits: 0,
      daily_renewal: 0,
      price_original: 99.9,
      price_current: 44.9,
      available: 35,
      sales: 0,
      checkout_link: '',
      highlight: false
    };
    
    // Auto-add 'pacotes' to section_order if not present
    let newSectionOrder = data.section_order || defaultSectionOrder;
    if (!newSectionOrder.includes('pacotes')) {
      // Insert 'pacotes' after 'video' or 'hero' if video is not present
      const videoIndex = newSectionOrder.indexOf('video');
      const heroIndex = newSectionOrder.indexOf('hero');
      const insertIndex = videoIndex !== -1 ? videoIndex + 1 : (heroIndex !== -1 ? heroIndex + 1 : 0);
      newSectionOrder = [
        ...newSectionOrder.slice(0, insertIndex),
        'pacotes' as SectionId,
        ...newSectionOrder.slice(insertIndex)
      ];
    }
    
    setData({
      ...data,
      pricing_tiers: [...(data.pricing_tiers || []), newTier],
      section_order: newSectionOrder
    });
  };

  const removePricingTier = (index: number) => {
    const newTiers = (data.pricing_tiers || []).filter((_, i) => i !== index);
    
    // Auto-remove 'pacotes' from section_order if no tiers left
    let newSectionOrder = data.section_order || defaultSectionOrder;
    if (newTiers.length === 0 && newSectionOrder.includes('pacotes')) {
      newSectionOrder = newSectionOrder.filter(s => s !== 'pacotes');
    }
    
    setData({
      ...data,
      pricing_tiers: newTiers,
      section_order: newSectionOrder
    });
  };

  const updatePricingTier = (index: number, field: string, value: any) => {
    const tiers = [...(data.pricing_tiers || [])];
    tiers[index] = { ...tiers[index], [field]: value };
    setData({ ...data, pricing_tiers: tiers });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Fixed background */}
        <div 
          className="fixed inset-0 -z-20"
          style={{ 
            backgroundImage: `url(${backgroundHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Dark overlay */}
        <div className="fixed inset-0 bg-[hsl(240,10%,4%)]/70 -z-10" />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const previewUrl = `${window.location.origin}/p/${data.slug}`;

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Fixed background for entire page - identical to Index */}
      <div 
        className="fixed inset-0 -z-20"
        style={{ 
          backgroundImage: `url(${backgroundHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Dark overlay - identical to Index */}
      <div className="fixed inset-0 bg-[hsl(240,10%,4%)]/70 -z-10" />
      
      {/* Tour for new users */}
      <EditorTour isNewPage={!isEditing} />
      
      {/* Header - identical to Index Header style */}
      <header id="tour-header" className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 h-16 sm:h-20">
        <div className="max-w-[1800px] mx-auto px-4 h-full flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="hidden sm:flex items-center h-full py-2">
              <img src={logoPainel} alt="Logo" className="h-10 sm:h-12 object-contain" />
            </Link>
            <div className="hidden md:block">
              <h1 className="font-semibold text-sm">{isEditing ? 'Editar' : 'Nova'} Landing Page</h1>
              <p className="text-xs text-muted-foreground">{data.slug ? getDisplayUrl(data.slug) : 'Configure a URL'}</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Auto-save indicator */}
            {autoSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Salvando...
              </span>
            )}
            {!autoSaving && lastSaved && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Salvo
              </span>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user && triggerEditorTour(user.id)}
              title="Ver tutorial"
              className="h-8 w-8"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            
            <Button 
              id="tour-preview-toggle"
              variant="outline" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="border-primary/50 hover:bg-primary/10"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Ocultar' : 'Mostrar'} Preview
            </Button>
            <Button 
              id="tour-save" 
              variant="hero"
              size="sm"
              onClick={handleSave} 
              disabled={saving || autoSaving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border w-[280px]">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="text-center mb-4">
                  <h2 className="font-semibold">{isEditing ? 'Editar' : 'Nova'} Landing Page</h2>
                  <p className="text-xs text-muted-foreground">{data.slug ? getDisplayUrl(data.slug) : 'Configure a URL'}</p>
                </div>
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSave();
                  }}
                  disabled={saving || autoSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowPreview(!showPreview);
                  }}
                >
                  {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user) triggerEditorTour(user.id);
                  }}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ver Tutorial
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content - with padding for fixed header */}
      {showPreview ? (
        <ResizablePanelGroup direction="horizontal" className="flex-1 pt-16 sm:pt-20" onLayout={handlePanelResize}>
          {/* Editor Panel */}
          <ResizablePanel defaultSize={defaultEditorSize} minSize={25} maxSize={75}>
            <div className="h-full overflow-auto">
          <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div id="tour-tabs" className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-2">
              <TabsList className="inline-flex flex-wrap gap-1 w-full h-auto p-1.5 bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl">
                  <TabsTrigger value="basico" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Básico</TabsTrigger>
                  <TabsTrigger value="layout" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Layout</TabsTrigger>
                  <TabsTrigger value="imagens" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Imagens</TabsTrigger>
                  <TabsTrigger value="video" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Vídeo</TabsTrigger>
                  <TabsTrigger value="precos" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Preços</TabsTrigger>
                  <TabsTrigger value="pacotes" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Pacotes</TabsTrigger>
                  <TabsTrigger value="sobre" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Sobre</TabsTrigger>
                  <TabsTrigger value="doacao" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Doação</TabsTrigger>
                  <TabsTrigger value="compra-segura" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Compra Segura</TabsTrigger>
                  <TabsTrigger value="conteudo" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Conteúdo</TabsTrigger>
                  <TabsTrigger value="depoimentos" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Depoimentos</TabsTrigger>
                  <TabsTrigger value="prova-social" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Prova Social</TabsTrigger>
                  <TabsTrigger value="faq" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">FAQ</TabsTrigger>
                  <TabsTrigger value="whatsapp" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">WhatsApp</TabsTrigger>
                  <TabsTrigger value="botoes" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Botões</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">SEO</TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Básico */}
              <TabsContent value="basico">
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                    <CardDescription>Configure os dados principais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div id="tour-slug" className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="slug" className="text-sm">URL Amigável</Label>
                        <Button variant="outline" size="sm" onClick={generateSlug} className="h-7 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Gerar
                        </Button>
                      </div>
                      <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => {
                          const value = e.target.value
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9-]/g, '')
                            .replace(/-+/g, '-');
                          setData({ ...data, slug: value });
                        }}
                        placeholder="minha-pagina"
                        className="bg-background/50"
                      />
                      {data.slug && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                          <span className="text-xs text-muted-foreground">Link:</span>
                          <code className="text-xs text-primary font-medium truncate">{getDisplayUrl(data.slug)}</code>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 text-xs ml-auto shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(getLandingPageUrl(data.slug));
                              toast.success('Link copiado!');
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use letras, números e hifens (ex: creditos-2024)
                      </p>
                    </div>

                    <div id="tour-title" className="space-y-2">
                      <Label htmlFor="title" className="text-sm">Título da Página</Label>
                      <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder="Painel Créditos Lovable"
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Nome interno para organização no dashboard
                      </p>
                    </div>

                    {/* Meta Title for SEO/Sharing */}
                    <div className="space-y-2">
                      <Label htmlFor="meta_title" className="text-sm">Título do App (SEO)</Label>
                      <Input
                        id="meta_title"
                        value={data.meta_title}
                        onChange={(e) => setData({ ...data, meta_title: e.target.value })}
                        placeholder="Lovable App Créditos Infinitos"
                        className="bg-background/50"
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground">
                        Aparece na aba do navegador e ao compartilhar. <span className="text-primary">{data.meta_title?.length || 0}/60</span>
                      </p>
                    </div>

                    {/* Meta Description for SEO/Sharing */}
                    <div className="space-y-2">
                      <Label htmlFor="meta_description" className="text-sm">Descrição do App (SEO)</Label>
                      <Textarea
                        id="meta_description"
                        value={data.meta_description}
                        onChange={(e) => setData({ ...data, meta_description: e.target.value })}
                        placeholder="Créditos Infinitos na Lovable. Simples. Rápido. Automático. Use nosso painel exclusivo e gere créditos ilimitados para seus projetos Lovable e revenda créditos."
                        className="bg-background/50 min-h-[80px]"
                        maxLength={160}
                      />
                      <p className="text-xs text-muted-foreground">
                        Descrição que aparece nos resultados de busca e ao compartilhar. <span className="text-primary">{data.meta_description?.length || 0}/160</span>
                      </p>
                    </div>

                    <div id="tour-publish" className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={data.is_published}
                          onCheckedChange={async (checked) => {
                            const newData = { ...data, is_published: checked };
                            setData(newData);
                            
                            // Salvar imediatamente quando o status de publicação mudar
                            if (data.id && user) {
                              try {
                                const { error } = await supabase
                                  .from('landing_pages')
                                  .update({ is_published: checked })
                                  .eq('id', data.id);
                                
                                if (error) {
                                  toast.error('Erro ao atualizar status');
                                } else {
                                  toast.success(checked ? 'Página publicada!' : 'Página despublicada');
                                  setLastSaved(new Date());
                                }
                              } catch (err) {
                                console.error('Error updating publish status:', err);
                              }
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">Publicada</p>
                          <p className="text-xs text-muted-foreground">
                            {data.is_published ? 'Visível' : 'Rascunho'}
                          </p>
                        </div>
                      </div>
                      {data.is_published && data.slug && (
                        <Button variant="outline" size="sm" onClick={() => window.open(`/p/${data.slug}`, '_blank')} className="h-7">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {/* Color Palette Selector */}
                    <div id="tour-colors" className="space-y-3 border-t border-border/30 pt-4">
                      <Label className="text-sm font-medium">Paleta de Cores</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {colorPalettes.map((palette) => (
                          <button
                            key={palette.name}
                            type="button"
                            onClick={() => setData({
                              ...data,
                              color_primary: palette.primary,
                              color_accent: palette.accent,
                              color_background: palette.background,
                            })}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              data.color_primary === palette.primary && data.color_accent === palette.accent
                                ? 'border-primary ring-2 ring-primary/30'
                                : 'border-border/50 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: palette.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: palette.accent }}
                              />
                            </div>
                            <p className="text-xs font-medium">{palette.name}</p>
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Primária</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={data.color_primary}
                              onChange={(e) => setData({ ...data, color_primary: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                            />
                            <Input
                              value={data.color_primary}
                              onChange={(e) => setData({ ...data, color_primary: e.target.value })}
                              className="h-10 text-xs bg-background/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Destaque</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={data.color_accent}
                              onChange={(e) => setData({ ...data, color_accent: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                            />
                            <Input
                              value={data.color_accent}
                              onChange={(e) => setData({ ...data, color_accent: e.target.value })}
                              className="h-10 text-xs bg-background/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Fundo</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={data.color_background}
                              onChange={(e) => setData({ ...data, color_background: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                            />
                            <Input
                              value={data.color_background}
                              onChange={(e) => setData({ ...data, color_background: e.target.value })}
                              className="h-10 text-xs bg-background/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/20 mt-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Cor do Texto Principal</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={data.color_text}
                              onChange={(e) => setData({ ...data, color_text: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                            />
                            <Input
                              value={data.color_text}
                              onChange={(e) => setData({ ...data, color_text: e.target.value })}
                              className="h-10 text-xs bg-background/50"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Primeira parte do título</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Cor do Texto Destaque</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={data.color_text_highlight}
                              onChange={(e) => setData({ ...data, color_text_highlight: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                            />
                            <Input
                              value={data.color_text_highlight}
                              onChange={(e) => setData({ ...data, color_text_highlight: e.target.value })}
                              className="h-10 text-xs bg-background/50"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">"Simples. Rápido. Automático."</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Cor dos Ícones</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={data.color_icons}
                              onChange={(e) => setData({ ...data, color_icons: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                            />
                            <Input
                              value={data.color_icons}
                              onChange={(e) => setData({ ...data, color_icons: e.target.value })}
                              className="h-10 text-xs bg-background/50"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Ícones das funcionalidades e badges</p>
                        </div>
                      </div>
                    </div>

                    {/* Typography Section */}
                    <div className="space-y-4 border-t border-border/30 pt-6">
                      <Label className="text-sm font-medium">Tipografia</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3">
                          <Label className="text-xs text-muted-foreground">Fonte dos Títulos (H1, H2, H3)</Label>
                          <select
                            value={data.font_heading}
                            onChange={(e) => setData({ ...data, font_heading: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm"
                          >
                            {fontOptions.map((font) => (
                              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.name}
                              </option>
                            ))}
                          </select>
                          <p 
                            className="text-lg font-bold p-3 rounded bg-background/30 text-center"
                            style={{ fontFamily: data.font_heading }}
                          >
                            Prévia H1
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs text-muted-foreground">Fonte do Corpo</Label>
                          <select
                            value={data.font_body}
                            onChange={(e) => setData({ ...data, font_body: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm"
                          >
                            {fontOptions.map((font) => (
                              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.name}
                              </option>
                            ))}
                          </select>
                          <p 
                            className="text-sm p-3 rounded bg-background/30 text-center"
                            style={{ fontFamily: data.font_body }}
                          >
                            Prévia do texto
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero_title" className="text-sm">Título Principal</Label>
                      <Input
                        id="hero_title"
                        value={data.hero_title}
                        onChange={(e) => setData({ ...data, hero_title: e.target.value })}
                        placeholder="Créditos Infinitos na Lovable."
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero_title_highlight" className="text-sm">Título em Destaque (Gradiente)</Label>
                      <Input
                        id="hero_title_highlight"
                        value={data.hero_title_highlight}
                        onChange={(e) => setData({ ...data, hero_title_highlight: e.target.value })}
                        placeholder="Simples. Rápido. Automático."
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero_subtitle" className="text-sm">Subtítulo</Label>
                      <Textarea
                        id="hero_subtitle"
                        value={data.hero_subtitle}
                        onChange={(e) => setData({ ...data, hero_subtitle: e.target.value })}
                        placeholder="Acesse o painel gerador..."
                        className="bg-background/50"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Preço Original (De)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={data.price_original || ''}
                          onChange={(e) => setData({ ...data, price_original: e.target.value ? Number(e.target.value) : null })}
                          placeholder="600"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Preço Atual (Por)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={data.price_current || ''}
                          onChange={(e) => setData({ ...data, price_current: e.target.value ? Number(e.target.value) : null })}
                          placeholder="349.99"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Texto do Botão</Label>
                        <Input
                          value={data.hero_cta_text}
                          onChange={(e) => setData({ ...data, hero_cta_text: e.target.value })}
                          placeholder="Comprar Agora"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Texto do Badge (ex: Oferta Limitada)</Label>
                        <Input
                          value={data.hero_badge_text}
                          onChange={(e) => setData({ ...data, hero_badge_text: e.target.value })}
                          placeholder="Oferta Limitada"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Texto de Renovação Diária (deixe vazio para ocultar)</Label>
                        <Input
                          value={data.hero_daily_renewal_text}
                          onChange={(e) => setData({ ...data, hero_daily_renewal_text: e.target.value })}
                          placeholder="Renovação diária de 5.000 créditos/dia !"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Link CTA</Label>
                      <Input
                        value={data.hero_cta_link}
                        onChange={(e) => setData({ ...data, hero_cta_link: e.target.value })}
                        placeholder="/checkout"
                        className="bg-background/50"
                      />
                    </div>

                    {/* Extra Prices */}
                    <div className="border-t border-border/30 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Preços Extras (exibidos abaixo do principal)</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setData({ ...data, hero_extra_prices: [...data.hero_extra_prices, { price_original: 0, price_current: 0, label: '' }] })}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Adicionar Preço
                        </Button>
                      </div>
                      {data.hero_extra_prices.map((ep, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-end">
                          <div className="space-y-1">
                            <Label className="text-xs">Rótulo (opcional)</Label>
                            <Input
                              value={ep.label || ''}
                              onChange={(e) => {
                                const updated = [...data.hero_extra_prices];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                setData({ ...data, hero_extra_prices: updated });
                              }}
                              placeholder="Oferta especial"
                              className="bg-background/50 text-sm h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Preço Original</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ep.price_original || ''}
                              onChange={(e) => {
                                const updated = [...data.hero_extra_prices];
                                updated[idx] = { ...updated[idx], price_original: Number(e.target.value) };
                                setData({ ...data, hero_extra_prices: updated });
                              }}
                              className="bg-background/50 text-sm h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Preço Atual</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ep.price_current || ''}
                              onChange={(e) => {
                                const updated = [...data.hero_extra_prices];
                                updated[idx] = { ...updated[idx], price_current: Number(e.target.value) };
                                setData({ ...data, hero_extra_prices: updated });
                              }}
                              className="bg-background/50 text-sm h-9"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setData({ ...data, hero_extra_prices: data.hero_extra_prices.filter((_, i) => i !== idx) })}
                            className="h-9"
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Extra Renewals */}
                    <div className="border-t border-border/30 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Renovações Extras</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setData({ ...data, hero_extra_renewals: [...data.hero_extra_renewals, { text: '' }] })}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Adicionar Renovação
                        </Button>
                      </div>
                      {data.hero_extra_renewals.map((er, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Texto da Renovação</Label>
                            <Input
                              value={er.text}
                              onChange={(e) => {
                                const updated = [...data.hero_extra_renewals];
                                updated[idx] = { text: e.target.value };
                                setData({ ...data, hero_extra_renewals: updated });
                              }}
                              placeholder="Renovação diária de 10.000 créditos/dia !"
                              className="bg-background/50 text-sm h-9"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setData({ ...data, hero_extra_renewals: data.hero_extra_renewals.filter((_, i) => i !== idx) })}
                            className="h-9"
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Preview */}
                    {(data.price_original || data.price_current) && (
                      <div className="border-t border-border/30 pt-4 mt-4 p-3 rounded-lg bg-background/30">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {data.price_original && (
                            <span className="text-sm line-through text-muted-foreground">R$ {Number(data.price_original).toFixed(2).replace('.', ',')}</span>
                          )}
                          {data.price_current && (
                            <span className="text-lg font-bold text-primary">R$ {Number(data.price_current).toFixed(2).replace('.', ',')}</span>
                          )}
                          {data.price_original && data.price_current && data.price_original > data.price_current && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                              Economia de {Math.round((1 - data.price_current / data.price_original) * 100)}%
                            </span>
                          )}
                        </div>
                        {data.hero_extra_prices.map((ep, idx) => (
                          <div key={idx} className="flex items-center gap-2 mt-1 flex-wrap">
                            {ep.label && <span className="text-xs text-muted-foreground">{ep.label}:</span>}
                            <span className="text-xs line-through text-muted-foreground">R$ {Number(ep.price_original).toFixed(2).replace('.', ',')}</span>
                            <span className="text-sm font-bold">R$ {Number(ep.price_current).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Imagens */}
              <TabsContent value="imagens">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Imagens</CardTitle>
                    <CardDescription>Upload ou cole URLs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <ImageUpload
                        label="Logo"
                        value={data.logo_image}
                        onChange={(url) => setData({ ...data, logo_image: url })}
                        folder="logos"
                        aspectRatio="aspect-[3/1]"
                        placeholder="Logo da sua marca"
                      />
                      <p className="text-xs text-muted-foreground">
                        Medida recomendada: <span className="font-medium text-primary">234x56px</span>
                      </p>
                    </div>
                    
                    {/* Logo Size Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm">Tamanho da Logo no Cabeçalho</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'small', label: 'P', desc: 'Pequeno' },
                          { value: 'medium', label: 'M', desc: 'Médio' },
                          { value: 'large', label: 'G', desc: 'Grande' },
                          { value: 'xlarge', label: 'GG', desc: 'Extra Grande' },
                        ].map((size) => (
                          <button
                            key={size.value}
                            type="button"
                            onClick={() => setData({ ...data, logo_size: size.value as 'small' | 'medium' | 'large' | 'xlarge' })}
                            className={`p-3 rounded-lg border transition-all text-center ${
                              data.logo_size === size.value
                                ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                                : 'border-border/50 hover:border-primary/50 bg-background/50'
                            }`}
                          >
                            <span className="font-bold text-lg">{size.label}</span>
                            <p className="text-xs text-muted-foreground mt-1">{size.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <ImageUpload
                        label="Imagem do Hero"
                        value={data.hero_image}
                        onChange={(url) => setData({ ...data, hero_image: url })}
                        folder="hero"
                        aspectRatio="aspect-video"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Medida recomendada: <span className="font-medium text-primary">1920x1080px</span>
                        </p>
                        <a href="/defaults/hero.png" download="hero-1920x1080.png" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <Download className="w-3 h-3" /> Baixar original
                        </a>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <ImageUpload
                        label="Mockup do Produto / Dashboard (Laptop)"
                        value={data.product_image}
                        onChange={(url) => setData({ ...data, product_image: url })}
                        folder="products"
                        aspectRatio="aspect-video"
                        placeholder="Imagem do laptop/mockup exibido na seção principal"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Imagem do laptop com dashboard na seção Hero. Medida recomendada: <span className="font-medium text-primary">1920x1080px</span>
                        </p>
                        <a href="/defaults/product.png" download="product-1920x1080.png" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <Download className="w-3 h-3" /> Baixar original
                        </a>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <ImageUpload
                        label="Imagem de Fundo"
                        value={data.background_image}
                        onChange={(url) => setData({ ...data, background_image: url })}
                        folder="backgrounds"
                        aspectRatio="aspect-[21/9]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Medida recomendada: <span className="font-medium text-primary">1536x1024px</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Preços */}
              <TabsContent value="precos">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Preços</CardTitle>
                    <CardDescription>Configure valores</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Preço Original (De)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={data.price_original || ''}
                          onChange={(e) => setData({ ...data, price_original: e.target.value ? Number(e.target.value) : null })}
                          placeholder="297.00"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Preço Atual (Por)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={data.price_current || ''}
                          onChange={(e) => setData({ ...data, price_current: e.target.value ? Number(e.target.value) : null })}
                          placeholder="97.00"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Parcelas</Label>
                      <Input
                        type="number"
                        min="1"
                        max="24"
                        value={data.price_installments}
                        onChange={(e) => setData({ ...data, price_installments: Number(e.target.value) })}
                        className="bg-background/50 max-w-24"
                      />
                    </div>

                    <div className="border-t border-border/30 pt-4 mt-4">
                      <h4 className="font-medium text-sm mb-3">Seção CTA Final</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Título do CTA</Label>
                          <Input
                            value={data.cta_title}
                            onChange={(e) => setData({ ...data, cta_title: e.target.value })}
                            placeholder="Pronto para começar?"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Subtítulo do CTA</Label>
                          <Input
                            value={data.cta_subtitle}
                            onChange={(e) => setData({ ...data, cta_subtitle: e.target.value })}
                            placeholder="Garanta seu acesso agora e transforme seus resultados"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Pacotes */}
              <TabsContent value="pacotes">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Pacotes de Créditos</CardTitle>
                        <CardDescription>Configure os pacotes de créditos exibidos na página principal</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addPricingTier}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Pacote
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(data.pricing_tiers || []).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-2">Nenhum pacote criado ainda</p>
                        <p className="text-xs">Adicione pacotes de créditos para exibir na landing page</p>
                      </div>
                    )}
                    
                    {(data.pricing_tiers || []).map((tier, index) => (
                      <div key={tier.id} className={`p-4 rounded-lg bg-background/50 border space-y-3 ${tier.highlight ? 'border-primary' : 'border-border/50'}`}>
                        {/* Row 1: Nome, Créditos, Bônus, Renovação */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nome do Pacote</Label>
                            <Input
                              value={tier.name}
                              onChange={(e) => updatePricingTier(index, 'name', e.target.value)}
                              placeholder="Pacote Iniciante"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Créditos</Label>
                            <Input
                              type="number"
                              value={tier.credits}
                              onChange={(e) => updatePricingTier(index, 'credits', Number(e.target.value))}
                              placeholder="1000"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Bônus de Créditos</Label>
                            <Input
                              type="number"
                              value={tier.bonus_credits || 0}
                              onChange={(e) => updatePricingTier(index, 'bonus_credits', Number(e.target.value))}
                              placeholder="0"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Renovação Diária</Label>
                            <Input
                              type="number"
                              value={tier.daily_renewal || 0}
                              onChange={(e) => updatePricingTier(index, 'daily_renewal', Number(e.target.value))}
                              placeholder="0"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                        </div>
                        
                        {/* Row 2: Preço Original, Preço Atual, Disponíveis, Vendas */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Preço Original (De)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={tier.price_original}
                              onChange={(e) => updatePricingTier(index, 'price_original', Number(e.target.value))}
                              placeholder="99.9"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Preço Atual (Por)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={tier.price_current}
                              onChange={(e) => updatePricingTier(index, 'price_current', Number(e.target.value))}
                              placeholder="44.9"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Disponíveis</Label>
                            <Input
                              type="number"
                              value={tier.available}
                              onChange={(e) => updatePricingTier(index, 'available', Number(e.target.value))}
                              placeholder="35"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Vendas</Label>
                            <Input
                              type="number"
                              value={tier.sales}
                              onChange={(e) => updatePricingTier(index, 'sales', Number(e.target.value))}
                              placeholder="127"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                        </div>
                        
                        {/* Row 3: Highlight + Remove */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Switch
                              checked={tier.highlight || false}
                              onCheckedChange={(checked) => updatePricingTier(index, 'highlight', checked)}
                            />
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Destacar (Mais Popular)
                            </span>
                          </label>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removePricingTier(index)}
                            className="h-7 text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Custom Package Options */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold">Pacote Personalizado (Opções)</h4>
                          <p className="text-xs text-muted-foreground">Configure os valores de créditos e preços disponíveis no card personalizado</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setData({ ...data, custom_package_options: [...data.custom_package_options, { credits: 100, price: 10, bonus_credits: 0 }] })}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Opção
                        </Button>
                      </div>
                      
                      {data.custom_package_options.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma opção configurada. O card personalizado não será exibido.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.custom_package_options.map((opt, index) => (
                            <div key={index} className="flex items-end gap-3">
                              <div className="flex-1 space-y-1">
                                <Label className="text-xs">Créditos</Label>
                                <Input
                                  type="number"
                                  value={opt.credits}
                                  onChange={(e) => {
                                    const updated = [...data.custom_package_options];
                                    updated[index] = { ...updated[index], credits: Number(e.target.value) };
                                    setData({ ...data, custom_package_options: updated });
                                  }}
                                  placeholder="100"
                                  className="bg-background/50 text-sm"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label className="text-xs">Preço (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={opt.price}
                                  onChange={(e) => {
                                    const updated = [...data.custom_package_options];
                                    updated[index] = { ...updated[index], price: Number(e.target.value) };
                                    setData({ ...data, custom_package_options: updated });
                                  }}
                                  placeholder="7.9"
                                  className="bg-background/50 text-sm"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label className="text-xs">Bônus</Label>
                                <Input
                                  type="number"
                                  value={opt.bonus_credits || 0}
                                  onChange={(e) => {
                                    const updated = [...data.custom_package_options];
                                    updated[index] = { ...updated[index], bonus_credits: Number(e.target.value) };
                                    setData({ ...data, custom_package_options: updated });
                                  }}
                                  placeholder="0"
                                  className="bg-background/50 text-sm"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                onClick={() => {
                                  const updated = data.custom_package_options.filter((_, i) => i !== index);
                                  setData({ ...data, custom_package_options: updated });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Promo Banner */}
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-semibold mb-3">Banner Promocional</h4>
                      <p className="text-xs text-muted-foreground mb-3">Texto exibido abaixo dos pacotes (deixe vazio para ocultar)</p>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Texto do Banner</Label>
                          <Input
                            value={data.promo_text}
                            onChange={(e) => setData({ ...data, promo_text: e.target.value })}
                            placeholder="🔥 Temos contas antigas com 10k por R$215"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Link do Banner (URL completa)</Label>
                          <Input
                            value={data.promo_link}
                            onChange={(e) => setData({ ...data, promo_link: e.target.value })}
                            placeholder="https://wa.me/5548996029392?text=..."
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Checkout Configuration */}
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-semibold mb-4">Configurações do Checkout</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={data.checkout_show_balance}
                              onCheckedChange={(checked) => setData({ ...data, checkout_show_balance: checked })}
                            />
                            <div>
                              <p className="font-medium text-sm">Exibir Saldo</p>
                              <p className="text-xs text-muted-foreground">Mostra o saldo do cliente</p>
                            </div>
                          </div>
                        </div>
                        
                        {data.checkout_show_balance && (
                          <div className="space-y-1">
                            <Label className="text-xs">Texto do Saldo</Label>
                            <Input
                              value={data.checkout_balance_label}
                              onChange={(e) => setData({ ...data, checkout_balance_label: e.target.value })}
                              placeholder="Seu saldo:"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <Label className="text-xs">Texto de Segurança</Label>
                          <Input
                            value={data.checkout_security_text}
                            onChange={(e) => setData({ ...data, checkout_security_text: e.target.value })}
                            placeholder="Pagamento 100% seguro"
                            className="bg-background/50 text-sm"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={data.checkout_invite_enabled}
                              onCheckedChange={(checked) => setData({ ...data, checkout_invite_enabled: checked })}
                            />
                            <div>
                              <p className="font-medium text-sm">Link de Convite</p>
                              <p className="text-xs text-muted-foreground">Permite adicionar link de convite</p>
                            </div>
                          </div>
                        </div>

                        {data.checkout_invite_enabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Rótulo</Label>
                              <Input
                                value={data.checkout_invite_label}
                                onChange={(e) => setData({ ...data, checkout_invite_label: e.target.value })}
                                placeholder="Link de Convite"
                                className="bg-background/50 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Placeholder</Label>
                              <Input
                                value={data.checkout_invite_placeholder}
                                onChange={(e) => setData({ ...data, checkout_invite_placeholder: e.target.value })}
                                placeholder="https://..."
                                className="bg-background/50 text-sm"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={data.checkout_coupon_enabled}
                              onCheckedChange={(checked) => setData({ ...data, checkout_coupon_enabled: checked })}
                            />
                            <div>
                              <p className="font-medium text-sm">Cupom de Desconto</p>
                              <p className="text-xs text-muted-foreground">Permite usar cupom</p>
                            </div>
                          </div>
                        </div>

                        {data.checkout_coupon_enabled && (
                          <div className="space-y-1">
                            <Label className="text-xs">Rótulo do Cupom</Label>
                            <Input
                              value={data.checkout_coupon_label}
                              onChange={(e) => setData({ ...data, checkout_coupon_label: e.target.value })}
                              placeholder="Cupom de Desconto"
                              className="bg-background/50 text-sm"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <Label className="text-xs">Texto do Botão</Label>
                          <Input
                            value={data.checkout_button_text}
                            onChange={(e) => setData({ ...data, checkout_button_text: e.target.value })}
                            placeholder="Continuar para Pagamento"
                            className="bg-background/50 text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Mensagem do WhatsApp</Label>
                          <p className="text-xs text-muted-foreground">
                            Use variáveis: {'{pacote}'}, {'{creditos}'}, {'{valor}'}, {'{nome}'}, {'{whatsapp}'}, {'{email}'}, {'{link_convite}'}, {'{cupom}'}, {'{data}'}
                          </p>
                          <Textarea
                            value={data.checkout_whatsapp_message}
                            onChange={(e) => setData({ ...data, checkout_whatsapp_message: e.target.value })}
                            placeholder="Mensagem para WhatsApp..."
                            className="bg-background/50 text-sm min-h-[200px] font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PIX Payment Configuration */}
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-semibold mb-4">💳 Configuração do PIX</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={data.pix_enabled}
                              onCheckedChange={(checked) => setData({ ...data, pix_enabled: checked })}
                            />
                            <div>
                              <p className="font-medium text-sm">Exibir PIX no Checkout</p>
                              <p className="text-xs text-muted-foreground">Mostra QR Code com valor para pagamento</p>
                            </div>
                          </div>
                        </div>

                        {data.pix_enabled && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Chave PIX 🔒</Label>
                              <Input
                                value={data.pix_key ? data.pix_key.replace(/(.{3}).*(.{3})/, '$1•••••$2') : ''}
                                readOnly
                                disabled
                                className="bg-background/50 text-sm opacity-60 cursor-not-allowed"
                                title="Campo protegido"
                              />
                              <p className="text-xs text-muted-foreground">🔒 Protegido</p>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Nome do Beneficiário 🔒</Label>
                              <Input
                                value={data.pix_name ? data.pix_name.replace(/(.{3}).*(.{3})/, '$1•••••$2') : ''}
                                readOnly
                                disabled
                                className="bg-background/50 text-sm opacity-60 cursor-not-allowed"
                                title="Campo protegido"
                              />
                              <p className="text-xs text-muted-foreground">🔒 Protegido</p>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">URL do QR Code Base (opcional)</Label>
                              <Input
                                value={data.pix_qr_base}
                                onChange={(e) => setData({ ...data, pix_qr_base: e.target.value })}
                                placeholder="https://nubank.com.br/cobrar/..."
                                className="bg-background/50 text-sm"
                              />
                              <p className="text-xs text-muted-foreground">
                                Cole a URL do QR Code do seu banco ou deixe vazio para gerar automaticamente
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Checkout Page Configuration */}
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-semibold mb-4">🛒 Página de Checkout</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={data.checkout_enabled}
                              onCheckedChange={(checked) => setData({ ...data, checkout_enabled: checked })}
                            />
                            <div>
                              <p className="font-medium text-sm">Exibir Seção de Checkout</p>
                              <p className="text-xs text-muted-foreground">Mostra o formulário de checkout na página</p>
                            </div>
                          </div>
                        </div>

                        {data.checkout_enabled && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Subtítulo do Produto</Label>
                              <Input
                                value={data.checkout_product_subtitle}
                                onChange={(e) => setData({ ...data, checkout_product_subtitle: e.target.value })}
                                placeholder="Acesso Completo"
                                className="bg-background/50 text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Descrição do Produto</Label>
                              <Input
                                value={data.checkout_product_description}
                                onChange={(e) => setData({ ...data, checkout_product_description: e.target.value })}
                                placeholder="Acesso vitalício • Sem mensalidades"
                                className="bg-background/50 text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Badge do Preço</Label>
                              <Input
                                value={data.checkout_badge_text}
                                onChange={(e) => setData({ ...data, checkout_badge_text: e.target.value })}
                                placeholder="OFERTA LIMITADA"
                                className="bg-background/50 text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Benefícios (O que você vai receber)</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setData({ ...data, checkout_benefits: [...data.checkout_benefits, 'Novo benefício'] })}
                                >
                                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                                </Button>
                              </div>
                              {data.checkout_benefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={benefit}
                                    onChange={(e) => {
                                      const updated = [...data.checkout_benefits];
                                      updated[index] = e.target.value;
                                      setData({ ...data, checkout_benefits: updated });
                                    }}
                                    className="bg-background/50 text-sm"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => {
                                      const updated = data.checkout_benefits.filter((_, i) => i !== index);
                                      setData({ ...data, checkout_benefits: updated });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Sobre */}
              <TabsContent value="sobre">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Sobre</CardTitle>
                    <CardDescription>Descreva seu produto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Título</Label>
                      <Input
                        value={data.about_title}
                        onChange={(e) => setData({ ...data, about_title: e.target.value })}
                        placeholder="Por que escolher nosso painel?"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Descrição</Label>
                      <Textarea
                        value={data.about_description}
                        onChange={(e) => setData({ ...data, about_description: e.target.value })}
                        placeholder="Descreva os benefícios..."
                        className="bg-background/50"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Vídeo */}
              <TabsContent value="video">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Seção de Vídeo</CardTitle>
                    <CardDescription>Configure o vídeo de demonstração</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={data.video_enabled}
                          onCheckedChange={(checked) => {
                            let newSectionOrder = [...data.section_order];
                            if (checked) {
                              // Add 'video' after 'hero' if not present
                              if (!newSectionOrder.includes('video')) {
                                const heroIndex = newSectionOrder.indexOf('hero');
                                if (heroIndex !== -1) {
                                  newSectionOrder.splice(heroIndex + 1, 0, 'video');
                                } else {
                                  newSectionOrder.unshift('video');
                                }
                              }
                            } else {
                              // Remove 'video' from order when disabled
                              newSectionOrder = newSectionOrder.filter(s => s !== 'video');
                            }
                            setData({ ...data, video_enabled: checked, section_order: newSectionOrder });
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">Exibir Seção</p>
                          <p className="text-xs text-muted-foreground">
                            {data.video_enabled ? 'Visível na página' : 'Oculta'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={data.video_hide_controls}
                          onCheckedChange={(checked) => setData({ ...data, video_hide_controls: checked })}
                        />
                        <div>
                          <p className="font-medium text-sm">🎮 Ocultar Comandos do Vídeo</p>
                          <p className="text-xs text-muted-foreground">
                            {data.video_hide_controls ? 'Controles ocultos (play, volume, barra)' : 'Controles visíveis'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Título da Seção</Label>
                      <Input
                        value={data.video_title}
                        onChange={(e) => setData({ ...data, video_title: e.target.value })}
                        placeholder="🎬 Como Funciona"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">URL do Vídeo (YouTube ou direto)</Label>
                      <Input
                        value={data.video_url}
                        onChange={(e) => setData({ ...data, video_url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=... ou URL do vídeo"
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Cole o link do YouTube ou a URL direta do vídeo (.mp4)
                      </p>
                    </div>

                    <ImageUpload
                      label="Thumbnail (Imagem de Capa)"
                      value={data.video_thumbnail}
                      onChange={(url) => setData({ ...data, video_thumbnail: url })}
                      folder="videos"
                      aspectRatio="aspect-video"
                      placeholder="Imagem exibida antes do play"
                    />

                    {data.video_url && (
                      <div className="border-t border-border/30 pt-4 mt-4">
                        <Label className="text-sm mb-2 block">Preview</Label>
                        <div className="aspect-video bg-background rounded-lg overflow-hidden">
                          {data.video_url.includes('youtube.com') || data.video_url.includes('youtu.be') ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${
                                data.video_url.includes('youtu.be') 
                                  ? data.video_url.split('/').pop()?.split('?')[0]
                                  : new URLSearchParams(data.video_url.split('?')[1]).get('v')
                              }`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video src={data.video_url} controls className="w-full h-full" />
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Doação */}
              <TabsContent value="doacao">
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Seção de Doação / PIX</CardTitle>
                    <CardDescription>Configure os dados PIX para receber doações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Ativar seção de doação</Label>
                      <input
                        type="checkbox"
                        checked={data.donation_enabled}
                        onChange={(e) => setData({ ...data, donation_enabled: e.target.checked })}
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={data.donation_title}
                        onChange={(e) => setData({ ...data, donation_title: e.target.value })}
                        placeholder="💚 Apoie o Desenvolvedor"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={data.donation_description}
                        onChange={(e) => setData({ ...data, donation_description: e.target.value })}
                        placeholder="Gostou do sistema? Considere fazer uma doação via PIX..."
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input
                        value={data.donation_pix_key}
                        onChange={(e) => setData({ ...data, donation_pix_key: e.target.value })}
                        placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">O QR Code será gerado automaticamente a partir desta chave</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Beneficiário</Label>
                      <Input
                        value={data.donation_pix_name}
                        onChange={(e) => setData({ ...data, donation_pix_name: e.target.value })}
                        placeholder="Nome completo do titular"
                        className="bg-background/50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Compra Segura */}
              <TabsContent value="compra-segura">
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Compra Segura</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setData({
                            ...data,
                            secure_purchase_items: [...(data.secure_purchase_items || []), { title: '', description: '', icon: 'Shield' }]
                          });
                        }} 
                        className="h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    <CardDescription>Configure os itens de confiança exibidos na seção</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(data.secure_purchase_items || []).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4 text-sm">Nenhum item de confiança</p>
                    ) : (
                      data.secure_purchase_items.map((item, index) => (
                        <div key={index} className="p-3 bg-background/50 rounded-lg space-y-2">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...data.secure_purchase_items];
                                  updated[index].title = e.target.value;
                                  setData({ ...data, secure_purchase_items: updated });
                                }}
                                placeholder="Título (ex: Produto Testado)"
                                className="bg-card text-sm"
                              />
                              <Input
                                value={item.description}
                                onChange={(e) => {
                                  const updated = [...data.secure_purchase_items];
                                  updated[index].description = e.target.value;
                                  setData({ ...data, secure_purchase_items: updated });
                                }}
                                placeholder="Descrição"
                                className="bg-card text-sm"
                              />
                              <Input
                                value={item.icon || ''}
                                onChange={(e) => {
                                  const updated = [...data.secure_purchase_items];
                                  updated[index].icon = e.target.value;
                                  setData({ ...data, secure_purchase_items: updated });
                                }}
                                placeholder="Ícone (Shield, Zap, Headphones, RefreshCw)"
                                className="bg-card text-sm"
                              />
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setData({
                                  ...data,
                                  secure_purchase_items: data.secure_purchase_items.filter((_, i) => i !== index)
                                });
                              }} 
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Conteúdo */}
              <TabsContent value="conteudo">
                <div className="space-y-4">

                  <Card className="bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recursos</CardTitle>
                        <Button variant="outline" size="sm" onClick={addFeature} className="h-7">
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(data.features || []).length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">Nenhum recurso</p>
                      ) : (
                        data.features.map((feature, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded-lg space-y-2">
                            <div className="flex gap-2 items-start">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                  value={feature.title}
                                  onChange={(e) => {
                                    const updated = [...data.features];
                                    updated[index].title = e.target.value;
                                    setData({ ...data, features: updated });
                                  }}
                                  placeholder="Título"
                                  className="bg-card text-sm"
                                />
                                <Input
                                  value={feature.description}
                                  onChange={(e) => {
                                    const updated = [...data.features];
                                    updated[index].description = e.target.value;
                                    setData({ ...data, features: updated });
                                  }}
                                  placeholder="Descrição"
                                  className="bg-card text-sm"
                                />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeFeature(index)} className="h-8 w-8">
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                            <Input
                              value={feature.icon || ''}
                              onChange={(e) => {
                                const updated = [...data.features];
                                updated[index].icon = e.target.value;
                                setData({ ...data, features: updated });
                              }}
                              placeholder="Ícone (ex: Zap, Shield)"
                              className="bg-card text-sm"
                            />
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Como Funciona</CardTitle>
                        <Button variant="outline" size="sm" onClick={addStep} className="h-7">
                          <Plus className="w-3 h-3 mr-1" />
                          Passo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(data.how_it_works || []).length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">Nenhum passo</p>
                      ) : (
                        data.how_it_works.map((step, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded-lg space-y-2">
                            <div className="flex gap-2 items-start">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                  value={step.title}
                                  onChange={(e) => {
                                    const updated = [...data.how_it_works];
                                    updated[index].title = e.target.value;
                                    setData({ ...data, how_it_works: updated });
                                  }}
                                  placeholder="Título"
                                  className="bg-card text-sm"
                                />
                                <Input
                                  value={step.description}
                                  onChange={(e) => {
                                    const updated = [...data.how_it_works];
                                    updated[index].description = e.target.value;
                                    setData({ ...data, how_it_works: updated });
                                  }}
                                  placeholder="Descrição"
                                  className="bg-card text-sm"
                                />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeStep(index)} className="h-8 w-8">
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab Depoimentos */}
              <TabsContent value="depoimentos">
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Depoimentos</CardTitle>
                      <Button variant="outline" size="sm" onClick={addTestimonial} className="h-7">
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(data.testimonials || []).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4 text-sm">Nenhum depoimento</p>
                    ) : (
                      data.testimonials.map((testimonial, index) => (
                        <div key={index} className="p-3 bg-background/50 rounded-lg space-y-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              value={testimonial.name}
                              onChange={(e) => {
                                const updated = [...data.testimonials];
                                updated[index].name = e.target.value;
                                setData({ ...data, testimonials: updated });
                              }}
                              placeholder="Nome"
                              className="bg-card flex-1 text-sm"
                            />
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={testimonial.rating}
                              onChange={(e) => {
                                const updated = [...data.testimonials];
                                updated[index].rating = Number(e.target.value);
                                setData({ ...data, testimonials: updated });
                              }}
                              className="bg-card w-16 text-sm"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeTestimonial(index)} className="h-8 w-8">
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                          <Textarea
                            value={testimonial.text}
                            onChange={(e) => {
                              const updated = [...data.testimonials];
                              updated[index].text = e.target.value;
                              setData({ ...data, testimonials: updated });
                            }}
                            placeholder="Texto..."
                            className="bg-card text-sm"
                            rows={2}
                          />
                          <Input
                            value={testimonial.avatar || ''}
                            onChange={(e) => {
                              const updated = [...data.testimonials];
                              updated[index].avatar = e.target.value;
                              setData({ ...data, testimonials: updated });
                            }}
                            placeholder="URL do avatar"
                            className="bg-card text-sm"
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Prova Social */}
              <TabsContent value="prova-social">
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Prova Social</CardTitle>
                        <CardDescription>Configure as notificações de compras recentes</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Ativar</Label>
                        <Switch
                          checked={data.social_proof_enabled}
                          onCheckedChange={(checked) => setData({ ...data, social_proof_enabled: checked })}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Nome do Produto</Label>
                      <Input
                        value={data.social_proof_product_name}
                        onChange={(e) => setData({ ...data, social_proof_product_name: e.target.value })}
                        placeholder="o Gerador"
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">Ex: "o Gerador", "o Painel Premium", "o Curso"</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Opções de Créditos</Label>
                      <div className="flex flex-wrap gap-2">
                        {[200, 500, 1000, 2000, 5000, 10000].map((credit) => {
                          const isSelected = (data.social_proof_credits || [200, 500, 1000, 2000]).includes(credit);
                          return (
                            <Button
                              key={credit}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const currentCredits = data.social_proof_credits || [200, 500, 1000, 2000];
                                const newCredits = isSelected
                                  ? currentCredits.filter(c => c !== credit)
                                  : [...currentCredits, credit].sort((a, b) => a - b);
                                setData({ ...data, social_proof_credits: newCredits });
                              }}
                              className="h-7 text-xs"
                            >
                              {credit >= 1000 ? `${credit / 1000}k` : credit}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">Selecione os valores de créditos que aparecerão nas notificações</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Lista de Clientes</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const newCustomer = { name: 'Novo Cliente', city: 'São Paulo', state: 'SP' };
                            setData({ 
                              ...data, 
                              social_proof_customers: [...(data.social_proof_customers || []), newCustomer] 
                            });
                          }}
                          className="h-7"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Adicione nomes e localizações que aparecerão nas notificações de compra
                      </p>

                      {(data.social_proof_customers || []).length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">Nenhum cliente cadastrado</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {(data.social_proof_customers || []).map((customer, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                              <Input
                                value={customer.name}
                                onChange={(e) => {
                                  const updated = [...(data.social_proof_customers || [])];
                                  updated[index] = { ...updated[index], name: e.target.value };
                                  setData({ ...data, social_proof_customers: updated });
                                }}
                                placeholder="Nome (ex: Carlos M.)"
                                className="bg-card text-sm flex-1"
                              />
                              <Input
                                value={customer.city}
                                onChange={(e) => {
                                  const updated = [...(data.social_proof_customers || [])];
                                  updated[index] = { ...updated[index], city: e.target.value };
                                  setData({ ...data, social_proof_customers: updated });
                                }}
                                placeholder="Cidade"
                                className="bg-card text-sm w-28"
                              />
                              <Input
                                value={customer.state}
                                onChange={(e) => {
                                  const updated = [...(data.social_proof_customers || [])];
                                  updated[index] = { ...updated[index], state: e.target.value };
                                  setData({ ...data, social_proof_customers: updated });
                                }}
                                placeholder="UF"
                                className="bg-card text-sm w-14"
                                maxLength={2}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  const updated = (data.social_proof_customers || []).filter((_, i) => i !== index);
                                  setData({ ...data, social_proof_customers: updated });
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab FAQ */}
              <TabsContent value="faq">
                <Card className="bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
                      <Button variant="outline" size="sm" onClick={addFaq} className="h-7">
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(data.faqs || []).length === 0 ? (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-muted-foreground text-sm">Nenhuma pergunta</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setData({ ...data, faqs: defaultData.faqs })}
                          className="h-8"
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Preencher com FAQs padrão
                        </Button>
                      </div>
                    ) : (
                      (data.faqs || []).map((faq, index) => (
                        <div key={index} className="p-3 bg-background/50 rounded-lg space-y-2">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={faq.question}
                                onChange={(e) => {
                                  const updated = [...(data.faqs || [])];
                                  updated[index].question = e.target.value;
                                  setData({ ...data, faqs: updated });
                                }}
                                placeholder="Pergunta"
                                className="bg-card text-sm"
                              />
                              <Textarea
                                value={faq.answer}
                                onChange={(e) => {
                                  const updated = [...(data.faqs || [])];
                                  updated[index].answer = e.target.value;
                                  setData({ ...data, faqs: updated });
                                }}
                                placeholder="Resposta..."
                                className="bg-card text-sm"
                                rows={3}
                              />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeFaq(index)} className="h-8 w-8 mt-1">
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab WhatsApp */}
              <TabsContent value="whatsapp">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      WhatsApp
                    </CardTitle>
                    <CardDescription>Configurações do botão flutuante e notificações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Botão Flutuante */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Botão Flutuante
                      </h4>
                      <div className="space-y-2">
                        <Label className="text-sm">Número do WhatsApp</Label>
                        <Input
                          value={data.whatsapp_number}
                          onChange={(e) => setData({ ...data, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                          placeholder="5548996029392"
                          className="bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground">
                          Formato: código do país + DDD + número (apenas números). Se preenchido, aparece um botão flutuante no canto da tela.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Mensagem do Botão Flutuante</Label>
                        <Textarea
                          value={data.whatsapp_message}
                          onChange={(e) => setData({ ...data, whatsapp_message: e.target.value })}
                          placeholder="Olá! Gostaria de mais informações sobre o produto."
                          className="bg-background/50"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Mensagem pré-definida quando o usuário clicar no botão flutuante
                        </p>
                      </div>
                    </div>

                    {/* Mensagem do Checkout */}
                    <div className="border-t border-border/30 pt-6 space-y-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Mensagem do Checkout
                      </h4>
                      <div className="space-y-2">
                        <Label className="text-sm">Template da Mensagem</Label>
                        <p className="text-xs text-muted-foreground">
                          Use variáveis: <code className="bg-muted px-1 rounded">{'{pacote}'}</code>, <code className="bg-muted px-1 rounded">{'{creditos}'}</code>, <code className="bg-muted px-1 rounded">{'{valor}'}</code>, <code className="bg-muted px-1 rounded">{'{nome}'}</code>, <code className="bg-muted px-1 rounded">{'{whatsapp}'}</code>, <code className="bg-muted px-1 rounded">{'{email}'}</code>, <code className="bg-muted px-1 rounded">{'{link_convite}'}</code>, <code className="bg-muted px-1 rounded">{'{cupom}'}</code>, <code className="bg-muted px-1 rounded">{'{data}'}</code>
                        </p>
                        <Textarea
                          value={data.checkout_whatsapp_message}
                          onChange={(e) => setData({ ...data, checkout_whatsapp_message: e.target.value })}
                          placeholder="🛒 *NOVO PEDIDO*..."
                          className="bg-background/50 font-mono text-sm"
                          rows={12}
                        />
                        <p className="text-xs text-muted-foreground">
                          Mensagem enviada quando o cliente finaliza uma compra
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Botões */}
              <TabsContent value="botoes">
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Botões do Menu</CardTitle>
                    <CardDescription>Ative/desative e personalize os botões de navegação</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.nav_buttons.map((btn, idx) => (
                      <div key={btn.id} className="rounded-lg border border-border/30 bg-secondary/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground">{btn.label || btn.id}</span>
                          <Switch
                            checked={btn.enabled}
                            onCheckedChange={(checked) => {
                              const updated = [...data.nav_buttons];
                              updated[idx] = { ...updated[idx], enabled: checked };
                              setData({ ...data, nav_buttons: updated });
                            }}
                          />
                        </div>
                        {btn.enabled && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nome do botão</Label>
                              <Input
                                value={btn.label}
                                onChange={(e) => {
                                  const updated = [...data.nav_buttons];
                                  updated[idx] = { ...updated[idx], label: e.target.value };
                                  setData({ ...data, nav_buttons: updated });
                                }}
                                placeholder="Ex: Comprar Agora"
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Ação / URL</Label>
                              <Input
                                value={btn.target}
                                onChange={(e) => {
                                  const updated = [...data.nav_buttons];
                                  const val = e.target.value;
                                  updated[idx] = { 
                                    ...updated[idx], 
                                    target: val,
                                    action: val.startsWith('http') ? 'link' : val.startsWith('#') ? 'scroll' : (btn.id === 'comprar_agora' ? 'cta' : 'scroll')
                                  };
                                  setData({ ...data, nav_buttons: updated });
                                }}
                                placeholder="#secao ou https://..."
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Use <code className="bg-secondary px-1 rounded">#secao</code> para scroll interno ou uma URL completa para link externo.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab SEO */}
              <TabsContent value="seo">
                <Card className="bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">SEO</CardTitle>
                    <CardDescription>Meta tags</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Meta Título</Label>
                      <Input
                        value={data.meta_title}
                        onChange={(e) => setData({ ...data, meta_title: e.target.value })}
                        placeholder="Título SEO (max 60)"
                        maxLength={60}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">{(data.meta_title || '').length}/60</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Meta Descrição</Label>
                      <Textarea
                        value={data.meta_description}
                        onChange={(e) => setData({ ...data, meta_description: e.target.value })}
                        placeholder="Descrição SEO (max 160)"
                        maxLength={160}
                        className="bg-background/50"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">{(data.meta_description || '').length}/160</p>
                    </div>
                    <ImageUpload
                      label="Imagem OG"
                      value={data.og_image}
                      onChange={(url) => setData({ ...data, og_image: url })}
                      folder="og"
                      aspectRatio="aspect-[1200/630]"
                    />
                    
                    {/* Facebook Pixel */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <Label className="text-sm flex items-center gap-2">
                        <span className="text-blue-500">📊</span> Facebook Pixel
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Cole o código do Pixel do Facebook (script completo). Será injetado automaticamente no &lt;head&gt; da sua página.
                      </p>
                      <Textarea
                        value={data.facebook_pixel}
                        onChange={(e) => setData({ ...data, facebook_pixel: e.target.value })}
                        placeholder={`<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)...
</script>
<!-- End Facebook Pixel Code -->`}
                        className="bg-background/50 font-mono text-xs"
                        rows={6}
                      />
                    </div>
                    
                    {/* Google Analytics */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <Label className="text-sm flex items-center gap-2">
                        <span className="text-orange-500">📈</span> Google Analytics (GA4)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Cole apenas o ID de medição (ex: G-XXXXXXXXXX) ou o script completo do Google Analytics.
                      </p>
                      <Textarea
                        value={data.google_analytics}
                        onChange={(e) => setData({ ...data, google_analytics: e.target.value })}
                        placeholder={`G-XXXXXXXXXX

ou cole o script completo:

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`}
                        className="bg-background/50 font-mono text-xs"
                        rows={6}
                      />
                    </div>
                    
                    {/* Google Tag Manager */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <Label className="text-sm flex items-center gap-2">
                        <span className="text-blue-600">🏷️</span> Google Tag Manager
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Cole apenas o ID do container (ex: GTM-XXXXXXX) ou o script completo do GTM.
                      </p>
                      <Textarea
                        value={data.google_tag_manager}
                        onChange={(e) => setData({ ...data, google_tag_manager: e.target.value })}
                        placeholder={`GTM-XXXXXXX

ou cole o script completo:

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>`}
                        className="bg-background/50 font-mono text-xs"
                        rows={5}
                      />
                    </div>
                    
                    {/* TikTok Pixel */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <Label className="text-sm flex items-center gap-2">
                        <span>🎵</span> TikTok Pixel
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Cole apenas o ID do pixel (ex: XXXXXXXXXX) ou o script completo do TikTok Pixel.
                      </p>
                      <Textarea
                        value={data.tiktok_pixel}
                        onChange={(e) => setData({ ...data, tiktok_pixel: e.target.value })}
                        placeholder={`XXXXXXXXXX

ou cole o script completo:

<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {...}(window, document, 'ttq');
ttq.load('XXXXXXXXXX');
ttq.page();
</script>`}
                        className="bg-background/50 font-mono text-xs"
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Layout */}
              <TabsContent value="layout" className="space-y-4">
                <SectionOrderManager
                  sectionOrder={data.section_order}
                  onOrderChange={(newOrder) => setData({ ...data, section_order: newOrder })}
                  disabledSections={defaultSectionOrder.filter(s => !data.section_order.includes(s))}
                  onToggleSection={async (sectionId, enabled) => {
                    const newOrder = enabled
                      ? [...data.section_order, sectionId]
                      : data.section_order.filter(s => s !== sectionId);
                    const newData = { ...data, section_order: newOrder };
                    setData(newData);
                    // Save immediately and refresh preview
                    if (data.id) {
                      try {
                        const payload = buildPayload(newData);
                        await supabase.from('landing_pages').update(payload).eq('id', data.id);
                        setLastSaved(new Date());
                        refreshPreview();
                      } catch (e) {
                        console.error('Toggle save error:', e);
                      }
                    }
                  }}
                />
                <Button
                  onClick={async () => {
                    await autoSave();
                    refreshPreview();
                    toast.success('Preview atualizado!');
                  }}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar Preview
                </Button>
              </TabsContent>
            </Tabs>
          </main>
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle className="bg-border/30 hover:bg-primary/50 transition-colors">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </ResizableHandle>

          {/* Preview Panel */}
          <ResizablePanel defaultSize={defaultPreviewSize} minSize={25} maxSize={75}>
            <div id="tour-preview-area" className="h-full border-l border-border/30 bg-muted/20 flex flex-col">
              <div className="p-3 border-b border-border/30 bg-card/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refreshPreview}
                    className="h-7 text-xs"
                    title="Atualizar preview"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={recreatePreview}
                    className="h-7 text-xs gap-1"
                    title="Recriar preview (desmontar e remontar iframe)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Recriar
                  </Button>
                  {data.slug && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(`/p/${data.slug}`, '_blank')} className="h-7 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Abrir
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {creatingDraft ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                      <p>Preparando preview...</p>
                    </div>
                  </div>
                ) : previewSrc && previewMounted ? (
                  <iframe
                    key={previewKey}
                    ref={iframeRef}
                    src={previewSrc}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                ) : previewSrc && !previewMounted ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                      <p>Recriando preview...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Configure a URL para ver o preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex-1 overflow-auto pt-16 sm:pt-20">
          <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div id="tour-tabs" className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <TabsList className="inline-flex w-auto min-w-full gap-1 p-1.5 bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl">
                  <TabsTrigger value="basico" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Básico</TabsTrigger>
                  <TabsTrigger value="layout" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Layout</TabsTrigger>
                  <TabsTrigger value="imagens" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Imagens</TabsTrigger>
                  <TabsTrigger value="precos" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Preços</TabsTrigger>
                  <TabsTrigger value="sobre" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Sobre</TabsTrigger>
                  <TabsTrigger value="doacao" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Doação</TabsTrigger>
                  <TabsTrigger value="conteudo" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Conteúdo</TabsTrigger>
                  <TabsTrigger value="depoimentos" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Depoimentos</TabsTrigger>
                  <TabsTrigger value="whatsapp" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">WhatsApp</TabsTrigger>
                  <TabsTrigger value="botoes" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Botões</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">SEO</TabsTrigger>
                </TabsList>
              </div>
              {/* Message when preview is hidden */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                <CardContent className="py-16 text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-primary/30" />
                  <h3 className="text-lg font-semibold mb-2">Preview Oculto</h3>
                  <p className="text-muted-foreground mb-6">
                    Clique em "Mostrar Preview" para editar com visualização em tempo real
                  </p>
                  <Button variant="hero" onClick={() => setShowPreview(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Mostrar Preview
                  </Button>
                </CardContent>
              </Card>
            </Tabs>
          </main>
        </div>
      )}
    </div>
  );
};

export default LandingPageEditor;
