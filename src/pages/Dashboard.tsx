import { useEffect, useState } from 'react';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { getLandingPageUrl } from '@/lib/urls';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ExternalLink, 
  Edit, 
  Trash2, 
  LogOut, 
  Loader2,
  LayoutDashboard,
  Shield,
  Heart,
  Copy,
  Check,
  HelpCircle,
  Menu,
  TrendingUp,
  Share2,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import logoPainel from '@/assets/logo-painel.png';
import backgroundHero from '@/assets/background-hero.png';
import { DashboardTour, triggerDashboardTour } from '@/components/DashboardTour';
import { SalesPanel } from '@/components/SalesPanel';

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { settings: homepageSettings } = useHomepageSettings();
  const navigate = useNavigate();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salesPanel, setSalesPanel] = useState<{ pageId: string; pageTitle: string } | null>(null);

  const pixKey = '48996029392';
  const pixName = 'Marcondes Jorge Machado';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopiedPix(false), 2000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPages();
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('id, slug, title, is_published, created_at, updated_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Erro ao carregar páginas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setPages(pages.filter(p => p.id !== deleteId));
      toast.success('Página excluída com sucesso');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Erro ao excluir página');
    } finally {
      setDeleteId(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
      
      {/* Dashboard Tour */}
      <DashboardTour />
      
      {/* Header - identical to Index Header style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 h-14 sm:h-16 md:h-18">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center h-full py-2">
            <img src={logoPainel} alt="Painel Créditos Lovable" className="h-full max-h-[32px] sm:max-h-[40px] md:max-h-[48px] w-auto object-contain object-left" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button 
              id="tour-dashboard-new-btn"
              variant="hero" 
              size="sm"
              onClick={() => navigate('/dashboard/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Página
            </Button>
            <Button 
              id="tour-dashboard-donate"
              variant="outline" 
              size="sm" 
              onClick={() => setShowDonationModal(true)}
              className="border-green-500/50 text-green-500 hover:bg-green-500/10"
            >
              <Heart className="w-4 h-4 mr-2" />
              Doar
            </Button>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard/admin')} 
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button 
              id="tour-dashboard-site"
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Ver Site
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user && triggerDashboardTour(user.id)}
              title="Ver tutorial"
              className="h-8 w-8"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
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
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard/new');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Página
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowDonationModal(true);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Doar
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard/admin');
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Painel Admin
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Ver Site
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user) triggerDashboardTour(user.id);
                  }}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ver Tutorial
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content - with padding for fixed header */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12">
        {/* Hero-like title section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-foreground">Suas </span>
            <span className="text-gradient">Landing Pages</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-2">
            Crie e gerencie suas páginas de vendas profissionais
          </p>
        </div>

        {/* Pages Grid */}
        <div id="tour-dashboard-pages">
          {pages.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-dashed border-border/50 max-w-lg mx-auto">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Plus className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nenhuma página criada</h3>
                <p className="text-muted-foreground mb-6">
                  Crie sua primeira landing page para começar a vender
                </p>
                <Button variant="hero" size="lg" onClick={() => navigate('/dashboard/new')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Landing Page
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <Card key={page.id} className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{page.title}</CardTitle>
                        <CardDescription className="truncate font-mono text-xs mt-1">/{page.slug}</CardDescription>
                      </div>
                      <Badge 
                        variant={page.is_published ? "default" : "secondary"}
                        className={page.is_published ? "bg-accent text-accent-foreground" : ""}
                      >
                        {page.is_published ? 'Publicada' : 'Rascunho'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => navigate(`/dashboard/edit/${page.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      {page.is_published && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-blue-500/20 hover:text-blue-500 hover:border-blue-500/50"
                              title="📤 Copiar link de divulgação"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2" align="center">
                            <div className="flex flex-col gap-1">
                              <p className="text-xs text-muted-foreground px-2 py-1 font-medium">Copiar link:</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-left h-auto py-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(getLandingPageUrl(page.slug));
                                  toast.success('Link copiado!', {
                                    description: 'Link completo com barra de navegação'
                                  });
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2 shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-medium">Copiar Link Normal</span>
                                  <span className="text-xs text-muted-foreground">Com barra e botões</span>
                                </div>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-left h-auto py-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(getLandingPageUrl(page.slug, true));
                                  toast.success('Link limpo copiado!', {
                                    description: 'Perfeito para divulgar para visitantes!'
                                  });
                                }}
                              >
                                <Share2 className="w-4 h-4 mr-2 shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-medium">Copiar Link Limpo</span>
                                  <span className="text-xs text-muted-foreground">Sem barra, ideal para visitantes</span>
                                </div>
                              </Button>
                              
                              <div className="border-t border-border my-1" />
                              <p className="text-xs text-muted-foreground px-2 py-1 font-medium">Abrir em nova aba:</p>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-left h-auto py-2"
                                onClick={() => window.open(getLandingPageUrl(page.slug), '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2 shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-medium">Abrir Normal</span>
                                  <span className="text-xs text-muted-foreground">Com barra e botões</span>
                                </div>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-left h-auto py-2 text-blue-500 hover:text-blue-400"
                                onClick={() => window.open(getLandingPageUrl(page.slug, true), '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2 shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-medium">Abrir Limpa</span>
                                  <span className="text-xs text-muted-foreground">Sem barra, como visitante vê</span>
                                </div>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSalesPanel({ pageId: page.id, pageTitle: page.title })}
                        className="hover:bg-green-500/20 hover:text-green-500 hover:border-green-500/50"
                        title="📊 Ver vendas e pedidos"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteId(page.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir página?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A página será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-green-500" />
              Apoie o Desenvolvedor
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <img 
                src="https://nubank.com.br/cobrar/6d6f1/6790d4a9-0f3e-4d0e-a217-4bb1f43a457e" 
                alt="QR Code PIX"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixKey}`;
                }}
              />
            </div>

            {/* PIX Info */}
            <div className="w-full space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Nome do beneficiário:</p>
                <p className="font-semibold">{pixName}</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Chave PIX (Telefone):</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono font-semibold">{pixKey}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPix}
                    className="shrink-0"
                  >
                    {copiedPix ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Sua doação ajuda a manter o projeto e desenvolver novas funcionalidades! 💚
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sales Panel */}
      <SalesPanel
        pageId={salesPanel?.pageId || ''}
        pageTitle={salesPanel?.pageTitle || ''}
        open={!!salesPanel}
        onOpenChange={(open) => !open && setSalesPanel(null)}
      />
      <SocialProofNotification 
        enabled={homepageSettings.social_proof.enabled}
        productName={homepageSettings.social_proof.product_name}
        customers={homepageSettings.social_proof.customers}
        creditOptions={homepageSettings.social_proof.credit_options}
      />
    </div>
  );
};

export default Dashboard;
