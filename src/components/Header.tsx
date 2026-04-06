import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from './LoginModal';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogOut, Menu, X, Download, Globe, Gift } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import logoPainelDefault from '@/assets/logo-painel.png';

export const Header = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useHomepageSettings();
  const mv = settings.menu_visibility;
  const logoSrc = settings.logo_url || logoPainelDefault;
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleOpenLogin = () => {
    setMobileMenuOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      <header className="relative mt-14 sm:mt-8 md:mt-0 md:fixed md:top-8 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 h-16 sm:h-18 md:h-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center h-full py-2 gap-2">
            <img src={logoSrc} alt="Painel Créditos Lovable" className="h-full max-h-[40px] sm:max-h-[48px] md:max-h-[56px] w-auto object-contain object-left" />
            <span className="text-lg sm:text-xl" role="img" aria-label={language === 'pt' ? 'Português' : 'English'}>
              {language === 'pt' ? '🇧🇷' : '🇺🇸'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {mv.painel_gerador && (
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate('/checkout')}
              >
                {t('header.generator')}
              </Button>
            )}
            {mv.entrar_conta && (
              user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.logout')}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setLoginOpen(true)}
                >
                  {t('header.create_account')}
                </Button>
              )
            )}
            {mv.compra_creditos && (
              <Button 
                variant="accent" 
                size="sm"
                onClick={() => scrollToSection('pacotes')}
              >
                {t('header.buy_credits')}
              </Button>
            )}
            <a href="https://central-opus-flow.lovable.app/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 gap-1">
                <Gift className="w-4 h-4" />
                Bônus
              </Button>
            </a>
            {mv.como_funciona && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => scrollToSection('faq')}
              >
                {t('header.how_it_works')}
              </Button>
            )}
            {mv.faq && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => scrollToSection('faq')}
              >
                {t('header.faq')}
              </Button>
            )}
            {mv.install && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => navigate('/install')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('header.install')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {mv.idioma && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Globe className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('pt')} className={language === 'pt' ? 'bg-accent' : ''}>
                    🇧🇷 Português
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
                    🇺🇸 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Tablet/Medium Navigation - simplified */}
          <nav className="hidden md:flex lg:hidden items-center gap-2">
            {mv.painel_gerador && <Button variant="hero" size="sm" onClick={() => navigate('/checkout')}>{t('header.generator')}</Button>}
            {mv.entrar_conta && (user ? (
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
            ) : (
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setLoginOpen(true)}>{t('header.create_account')}</Button>
            ))}
            {mv.compra_creditos && <Button variant="accent" size="sm" onClick={() => scrollToSection('pacotes')}>{t('header.buy_credits')}</Button>}
            <a href="https://central-opus-flow.lovable.app/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 gap-1"><Gift className="w-4 h-4" />Bônus</Button>
            </a>
            {mv.como_funciona && <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => scrollToSection('faq')}>{t('header.how_it_works')}</Button>}
            {mv.faq && <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => scrollToSection('faq')}>{t('header.faq')}</Button>}
            {mv.idioma && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Globe className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('pt')} className={language === 'pt' ? 'bg-accent' : ''}>🇧🇷 Português</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>🇺🇸 English</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border w-[280px]">
              <div className="flex justify-center mb-6 pt-2">
                <img src={logoSrc} alt="Painel Créditos Lovable" className="h-12 w-auto object-contain" />
              </div>
              <nav className="flex flex-col gap-4">
                {mv.painel_gerador && <Button variant="hero" className="w-full" onClick={() => handleNavigate('/checkout')}>{t('header.generator')}</Button>}
                {mv.entrar_conta && (user ? (
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />{t('header.logout')}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleOpenLogin}>
                    {t('header.create_account')}
                  </Button>
                ))}
                {mv.compra_creditos && <Button variant="accent" className="w-full" onClick={() => scrollToSection('pacotes')}>{t('header.buy_credits')}</Button>}
                <a href="https://central-opus-flow.lovable.app/" target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="ghost" className="w-full justify-start text-primary hover:bg-primary/10 gap-1" onClick={() => setMobileMenuOpen(false)}><Gift className="w-4 h-4" />Bônus</Button>
                </a>
                {mv.como_funciona && <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => scrollToSection('faq')}>{t('header.how_it_works')}</Button>}
                {mv.faq && <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => scrollToSection('faq')}>{t('header.faq')}</Button>}
                {mv.install && <Button variant="outline" className="w-full" onClick={() => handleNavigate('/install')}><Download className="w-4 h-4 mr-2" />{t('header.install')}</Button>}
                {mv.idioma && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant={language === 'pt' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => { setLanguage('pt'); setMobileMenuOpen(false); }}>🇧🇷 PT</Button>
                    <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }}>🇺🇸 EN</Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};
