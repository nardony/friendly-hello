import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already dismissed or installed
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (dismissed || isStandalone) return;

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Show banner for iOS after delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for install prompt on other devices
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Redirect to install page for iOS instructions
      window.location.href = '/install';
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto bg-gradient-to-r from-primary/90 to-purple-600/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary/20 p-4 border border-white/10">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm">
              Instale o Painel Crédito
            </h3>
            <p className="text-white/80 text-xs mt-0.5">
              Acesse mais rápido direto da sua tela inicial
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold h-10"
          >
            <Download className="w-4 h-4 mr-2" />
            {isIOS ? 'Como Instalar' : 'Instalar'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 h-10 px-4"
          >
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
};
