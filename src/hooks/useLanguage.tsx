import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Header
    'header.generator': 'Painel Gerador',
    'header.create_account': 'Entrar na conta',
    'header.logout': 'Sair',
    'header.how_it_works': 'Como Funciona',
    'header.faq': 'FAQ',
    'header.install': 'Instalar App',
    'header.buy_credits': 'Compra de Créditos',
    // Cookie Banner
    'cookie.title': 'Proteção de Dados & Cookies',
    'cookie.description': 'Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar sua experiência. Seus dados são protegidos conforme a',
    'cookie.lgpd': 'Lei Geral de Proteção de Dados (LGPD)',
    'cookie.continue': 'Ao continuar navegando, você concorda com nossa',
    'cookie.privacy': 'Política de Privacidade',
    'cookie.and': 'e',
    'cookie.terms': 'Termos de Uso',
    'cookie.your_ip': 'Seu IP',
    'cookie.accept_all': 'Aceitar Todos',
    'cookie.essential_only': 'Apenas Essenciais',
    // Hero
    'hero.title': 'Créditos Infinitos na Lovable.',
    'hero.title_highlight': 'Simples. Rápido. Automático.',
    'hero.subtitle': 'Use nosso painel exclusivo e gere créditos baratos e tenha uma nova renda. Liberação após pagamento.',
    'hero.cta_text': 'Comprar Agora',
    'hero.badge_text': 'Oferta Limitada',
    'hero.savings': 'Economia de',
    'hero.expires_in': 'EXPIRA EM',
    'hero.auto_delivery': 'Entrega Automática',
    'hero.secure_payment': 'Pagamento Seguro',
    'hero.support_available': 'Suporte Disponível',
    'hero.see_plans': 'Pacotes de Créditos Avulsos Abaixo!',
    // Features
    'features.section_title': 'O que é o',
    'features.section_title_highlight': 'Painel',
    'features.section_subtitle': 'Uma ferramenta automatizada que gera créditos para sua conta Lovable de forma simples e rápida.',
    'features.simple_interface': 'Interface Simples',
    'features.simple_interface_desc': 'Painel intuitivo, sem complicações. Qualquer pessoa consegue usar.',
    'features.automated': '100% Automatizado',
    'features.automated_desc': 'O sistema faz todo o trabalho. Você só precisa clicar.',
    'features.unlimited': 'Créditos Ilimitados',
    'features.unlimited_desc': 'Gere quantos créditos precisar, sem limites ou restrições.',
    // Why Choose
    'why.title_pre': 'Por que',
    'why.title_highlight': 'escolher',
    'why.title_post': 'o painel?',
    'why.subtitle': 'Tudo que você precisa para usar a Lovable sem preocupações.',
    'why.b1': 'Créditos ilimitados para seus projetos',
    'why.b2': 'Interface simples e intuitiva',
    'why.b3': 'Uso imediato após a compra',
    'why.b4': 'Não exige conhecimento técnico',
    'why.b5': 'Ideal para quem usa Lovable com frequência',
    'why.b6': 'Funciona 24 horas por dia',
    'why.b7': 'Atualizações gratuitas incluídas',
    'why.b8': 'Suporte via chat disponível',
    // Pricing
    'pricing.title_pre': 'Escolha seu',
    'pricing.title_highlight': 'Pacote de Créditos',
    'pricing.subtitle': 'Selecione a quantidade de créditos ideal para você. Quanto mais créditos, maior a economia!',
    'pricing.most_popular': 'MAIS POPULAR',
    'pricing.credits': 'de créditos',
    'pricing.bonus': 'bônus',
    'pricing.official_price': 'Preço oficial',
    'pricing.our_price': 'Nosso preço',
    'pricing.available': 'disp.',
    'pricing.savings': 'Economia de',
    'pricing.sales': 'vendas',
    'pricing.available_label': 'Disponível',
    'pricing.buy_now': 'Comprar Agora',
    'pricing.custom_title': 'Quantidade Personalizada',
    'pricing.tap_to_choose': 'Toque para escolher',
    'pricing.tap_desc': 'Toque para escolher esta quantidade',
    'pricing.bonus_credits': 'créditos bônus',
    'pricing.urgency': 'Enquanto a recarga de créditos está disponível, este é o',
    'pricing.urgency_bold': 'momento ideal',
    'pricing.urgency_end': 'para escalar seus projetos.',
    'pricing.faq_link': 'Como funciona a recarga de créditos?',
    // Secure Purchase
    'secure.title_pre': 'Compra',
    'secure.title_highlight': 'Segura',
    'secure.subtitle': 'Sua confiança é nossa prioridade.',
    'secure.item1_title': 'Produto Testado',
    'secure.item1_desc': 'Ferramenta validada e funcionando perfeitamente.',
    'secure.item2_title': 'Entrega Automática',
    'secure.item2_desc': 'Receba acesso imediato após a confirmação do pagamento.',
    'secure.item3_title': 'Suporte Disponível',
    'secure.item3_desc': 'Equipe pronta para ajudar sempre que precisar.',
    'secure.item4_title': 'Atualizações Gratuitas',
    'secure.item4_desc': 'Melhorias constantes sem custo adicional.',
    // How It Works
    'how.title_pre': 'Como',
    'how.title_highlight': 'funciona',
    'how.subtitle': 'Processo simples em 4 passos.',
    'how.step1_title': 'Compre o Acesso',
    'how.step1_desc': 'Pagamento rápido e seguro. Acesso liberado na hora.',
    'how.step2_title': 'Entre no Painel',
    'how.step2_desc': 'Receba suas credenciais e acesse a plataforma.',
    'how.step3_title': 'Gere Créditos',
    'how.step3_desc': 'Com poucos cliques, seus créditos são gerados automaticamente.',
    'how.step4_title': 'Use na Lovable',
    'how.step4_desc': 'Aproveite seus créditos e crie projetos sem limites.',
    // Testimonials
    'testimonials.title': 'O que nossos clientes dizem',
    'testimonials.positive': 'de avaliações positivas',
    'testimonials.reviews': 'avaliações',
    'testimonials.recommends': 'Recomenda',
    'testimonials.credits': 'créditos',
    // Stats
    'stats.members': 'Membros Ativos',
    'stats.credits_min': 'Créditos gerados/min',
    'stats.satisfaction': 'Satisfação',
    // Final CTA
    'cta.title_pre': 'Pronto para ter',
    'cta.title_highlight': 'créditos infinitos',
    'cta.subtitle': 'Junte-se aos usuários que já estão aproveitando a Lovable sem limites.',
    'cta.button': 'Comprar Agora',
    // Recharge Info
    'recharge.title_pre': 'Recarregue em',
    'recharge.title_post': 'minutos',
    'recharge.secure': 'Seguro',
    'recharge.no_ban': 'Sem risco de banimento',
    'recharge.bonus': 'Bônus',
    'recharge.bonus_suffix': 'em todos os pacotes',
    'recharge.credit_active_pre': 'O crédito permanece ativo até a',
    'recharge.credit_active_bold': 'próxima recarga.',
    // Checkout page
    'checkout.back': 'Voltar',
    'checkout.full_access': 'Acesso Completo',
    'checkout.lifetime_access': 'Acesso vitalício • Sem mensalidades',
    'checkout.limited_offer': 'Oferta Limitada',
    'checkout.savings': 'Economia de',
    'checkout.secure_purchase': 'Compra Segura',
    'checkout.auto_delivery': 'Entrega Automática',
    'checkout.support_24h': 'Suporte 24h',
    'checkout.what_you_get': 'O que você vai receber:',
    'checkout.your_email': 'Seu Email',
    'checkout.email_placeholder': 'seu@email.com',
    'checkout.email_hint': 'O acesso será enviado para este email',
    'checkout.data_protected': 'Seus dados estão protegidos • Acesso liberado automaticamente',
    'checkout.buy_now': 'COMPRAR AGORA',
    'checkout.already_customer': 'Já é cliente?',
    'checkout.click_here': 'Clique aqui para acessar o painel',
    'checkout.agree_terms': 'Ao comprar, você concorda com nossos',
    'checkout.terms': 'Termos de Uso',
    'checkout.and': 'e',
    'checkout.privacy': 'Política de Privacidade',
    // Footer
    'footer.support': 'Suporte via WhatsApp',
    'footer.clear_cache': 'Limpar Cache',
    'footer.clearing': 'Limpando...',
    'footer.rights': '© 2026 Curso Lovable. Todos os direitos reservados.',
    'footer.version': 'Versão',
    'footer.updated': 'Atualizado em',
    // Language
    'lang.pt': 'Português',
    'lang.en': 'English',
    // Login Modal
    'login.title': 'Entrar na conta',
    'login.subtitle': 'Acesse o painel de gerenciamento',
    'login.email': 'Email',
    'login.password': 'Senha',
    'login.submit': 'Entrar',
  },
  en: {
    // Header
    'header.generator': 'Generator Panel',
    'header.create_account': 'Sign In',
    'header.logout': 'Logout',
    'header.how_it_works': 'How It Works',
    'header.faq': 'FAQ',
    'header.install': 'Install App',
    'header.buy_credits': 'Buy Credits',
    // Cookie Banner
    'cookie.title': 'Data Protection & Cookies',
    'cookie.description': 'We use essential cookies for site functionality and analytics cookies to improve your experience. Your data is protected according to the',
    'cookie.lgpd': 'General Data Protection Law (LGPD)',
    'cookie.continue': 'By continuing to browse, you agree to our',
    'cookie.privacy': 'Privacy Policy',
    'cookie.and': 'and',
    'cookie.terms': 'Terms of Use',
    'cookie.your_ip': 'Your IP',
    'cookie.accept_all': 'Accept All',
    'cookie.essential_only': 'Essential Only',
    // Hero
    'hero.title': 'Unlimited Credits on Lovable.',
    'hero.title_highlight': 'Simple. Fast. Automatic.',
    'hero.subtitle': 'Use our exclusive panel and generate unlimited credits for your Lovable projects and resell credits.',
    'hero.cta_text': 'Buy Now',
    'hero.badge_text': 'Limited Offer',
    'hero.savings': 'Save',
    'hero.expires_in': 'EXPIRES IN',
    'hero.auto_delivery': 'Auto Delivery',
    'hero.secure_payment': 'Secure Payment',
    'hero.support_available': 'Support Available',
    'hero.see_plans': 'See plans below',
    // Features
    'features.section_title': 'What is the',
    'features.section_title_highlight': 'Panel',
    'features.section_subtitle': 'An automated tool that generates credits for your Lovable account quickly and easily.',
    'features.simple_interface': 'Simple Interface',
    'features.simple_interface_desc': 'Intuitive panel, no complications. Anyone can use it.',
    'features.automated': '100% Automated',
    'features.automated_desc': 'The system does all the work. You just need to click.',
    'features.unlimited': 'Unlimited Credits',
    'features.unlimited_desc': 'Generate as many credits as you need, with no limits or restrictions.',
    // Why Choose
    'why.title_pre': 'Why',
    'why.title_highlight': 'choose',
    'why.title_post': 'the panel?',
    'why.subtitle': 'Everything you need to use Lovable worry-free.',
    'why.b1': 'Unlimited credits for your projects',
    'why.b2': 'Simple and intuitive interface',
    'why.b3': 'Immediate use after purchase',
    'why.b4': 'No technical knowledge required',
    'why.b5': 'Ideal for frequent Lovable users',
    'why.b6': 'Works 24 hours a day',
    'why.b7': 'Free updates included',
    'why.b8': 'Chat support available',
    // Pricing
    'pricing.title_pre': 'Choose your',
    'pricing.title_highlight': 'Credits Package',
    'pricing.subtitle': 'Select the ideal amount of credits for you. The more credits, the bigger the savings!',
    'pricing.most_popular': 'MOST POPULAR',
    'pricing.credits': 'credits',
    'pricing.bonus': 'bonus',
    'pricing.official_price': 'Official price',
    'pricing.our_price': 'Our price',
    'pricing.available': 'avail.',
    'pricing.savings': 'Save',
    'pricing.sales': 'sales',
    'pricing.available_label': 'Available',
    'pricing.buy_now': 'Buy Now',
    'pricing.custom_title': 'Custom Amount',
    'pricing.tap_to_choose': 'Tap to choose',
    'pricing.tap_desc': 'Tap to choose this amount',
    'pricing.bonus_credits': 'bonus credits',
    'pricing.urgency': 'While credit recharges are available, this is the',
    'pricing.urgency_bold': 'ideal moment',
    'pricing.urgency_end': 'to scale your projects.',
    'pricing.faq_link': 'How does credit recharging work?',
    // Secure Purchase
    'secure.title_pre': 'Secure',
    'secure.title_highlight': 'Purchase',
    'secure.subtitle': 'Your trust is our priority.',
    'secure.item1_title': 'Tested Product',
    'secure.item1_desc': 'Validated tool working perfectly.',
    'secure.item2_title': 'Auto Delivery',
    'secure.item2_desc': 'Get immediate access after payment confirmation.',
    'secure.item3_title': 'Support Available',
    'secure.item3_desc': 'Team ready to help whenever you need.',
    'secure.item4_title': 'Free Updates',
    'secure.item4_desc': 'Constant improvements at no additional cost.',
    // How It Works
    'how.title_pre': 'How does it',
    'how.title_highlight': 'work',
    'how.subtitle': 'Simple process in 4 steps.',
    'how.step1_title': 'Buy Access',
    'how.step1_desc': 'Fast and secure payment. Instant access.',
    'how.step2_title': 'Log In',
    'how.step2_desc': 'Receive your credentials and access the platform.',
    'how.step3_title': 'Generate Credits',
    'how.step3_desc': 'With just a few clicks, your credits are generated automatically.',
    'how.step4_title': 'Use on Lovable',
    'how.step4_desc': 'Enjoy your credits and create projects without limits.',
    // Testimonials
    'testimonials.title': 'What our customers say',
    'testimonials.positive': 'positive reviews',
    'testimonials.reviews': 'reviews',
    'testimonials.recommends': 'Recommends',
    'testimonials.credits': 'credits',
    // Stats
    'stats.members': 'Active Members',
    'stats.credits_min': 'Credits generated/min',
    'stats.satisfaction': 'Satisfaction',
    // Final CTA
    'cta.title_pre': 'Ready for',
    'cta.title_highlight': 'unlimited credits',
    'cta.subtitle': 'Join the users who are already enjoying Lovable without limits.',
    'cta.button': 'Buy Now',
    // Recharge Info
    'recharge.title_pre': 'Recharge in',
    'recharge.title_post': 'minutes',
    'recharge.secure': 'Secure',
    'recharge.no_ban': 'No risk of ban',
    'recharge.bonus': 'Bonus',
    'recharge.bonus_suffix': 'on all packages',
    'recharge.credit_active_pre': 'Credits remain active until the',
    'recharge.credit_active_bold': 'next recharge.',
    // Checkout page
    'checkout.back': 'Back',
    'checkout.full_access': 'Full Access',
    'checkout.lifetime_access': 'Lifetime access • No monthly fees',
    'checkout.limited_offer': 'Limited Offer',
    'checkout.savings': 'Save',
    'checkout.secure_purchase': 'Secure Purchase',
    'checkout.auto_delivery': 'Auto Delivery',
    'checkout.support_24h': '24h Support',
    'checkout.what_you_get': 'What you will receive:',
    'checkout.your_email': 'Your Email',
    'checkout.email_placeholder': 'your@email.com',
    'checkout.email_hint': 'Access will be sent to this email',
    'checkout.data_protected': 'Your data is protected • Access released automatically',
    'checkout.buy_now': 'BUY NOW',
    'checkout.already_customer': 'Already a customer?',
    'checkout.click_here': 'Click here to access the panel',
    'checkout.agree_terms': 'By purchasing, you agree to our',
    'checkout.terms': 'Terms of Use',
    'checkout.and': 'and',
    'checkout.privacy': 'Privacy Policy',
    // Footer
    'footer.support': 'WhatsApp Support',
    'footer.clear_cache': 'Clear Cache',
    'footer.clearing': 'Clearing...',
    'footer.rights': '© 2026 Credits Generator Panel. All rights reserved.',
    'footer.version': 'Version',
    'footer.updated': 'Updated on',
    // Language
    'lang.pt': 'Português',
    'lang.en': 'English',
    // Login Modal
    'login.title': 'Sign In',
    'login.subtitle': 'Access the management panel',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLanguage(): Language {
  const saved = localStorage.getItem('app_language') as Language;
  if (saved && (saved === 'pt' || saved === 'en')) return saved;

  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  return browserLang.startsWith('pt') ? 'pt' : 'en';
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  };

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
