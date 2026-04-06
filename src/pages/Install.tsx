import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, Check, Share, Plus, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Painel Crédito Lovable2026</h1>
          <p className="text-muted-foreground">
            Acesse mais rápido direto da sua tela inicial
          </p>
        </div>

        {isInstalled ? (
          <Card className="bg-card/50 border-green-500/30">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-500">App Instalado!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Você já pode acessar o Painel Crédito pela sua tela inicial
                </p>
              </div>
              <Link to="/">
                <Button className="w-full">
                  Ir para o App
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card className="bg-card/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-center">Como instalar no iPhone/iPad</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">1. Toque em Compartilhar</p>
                    <p className="text-sm text-muted-foreground">
                      No Safari, toque no ícone de compartilhar na barra inferior
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">2. Adicionar à Tela de Início</p>
                    <p className="text-sm text-muted-foreground">
                      Role para baixo e toque em "Adicionar à Tela de Início"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">3. Confirmar</p>
                    <p className="text-sm text-muted-foreground">
                      Toque em "Adicionar" no canto superior direito
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card className="bg-card/50">
            <CardContent className="p-6 space-y-4">
              <Button 
                onClick={handleInstall}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar App
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Instale o app para acessar mais rápido, funciona offline!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-center">Como instalar no Android</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <MoreVertical className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">1. Abra o menu do navegador</p>
                    <p className="text-sm text-muted-foreground">
                      Toque nos três pontos no canto superior direito
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">2. Instalar app</p>
                    <p className="text-sm text-muted-foreground">
                      Toque em "Instalar app" ou "Adicionar à tela inicial"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">3. Confirmar</p>
                    <p className="text-sm text-muted-foreground">
                      Confirme a instalação na janela que aparecer
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Acesso rápido</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Funciona offline</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Sem anúncios</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Continuar no navegador →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Install;
