import { MessageCircle, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_VERSION, LAST_UPDATE } from '@/config/version';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppSettings } from '@/hooks/useAppSettings';

export const Footer = () => {
  const [clearing, setClearing] = useState(false);
  const { language, t } = useLanguage();
  const { settings: appSettings } = useAppSettings();

  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Cache limpo com sucesso! Recarregando...');
      setTimeout(() => { window.location.reload(); }, 1000);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
    } finally {
      setClearing(false);
    }
  };

  return (
    <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-t border-border/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <a
            href={`https://wa.me/${appSettings?.whatsapp_number || '5548996029392'}?text=${encodeURIComponent(language === 'en' ? 'Hi! I need support.' : 'Olá! Preciso de suporte.')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="default" className="gap-2 w-full sm:w-auto">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('footer.support')}
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={handleClearCache} disabled={clearing} className="gap-2 text-muted-foreground hover:text-foreground">
            <RefreshCw className={`w-4 h-4 ${clearing ? 'animate-spin' : ''}`} />
            {clearing ? t('footer.clearing') : t('footer.clear_cache')}
          </Button>
        </div>
        
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
          {t('footer.rights')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 md:gap-4 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>{t('footer.version')} {APP_VERSION}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>{t('footer.updated')} {LAST_UPDATE}</span>
        </div>
      </div>
    </footer>
  );
};
