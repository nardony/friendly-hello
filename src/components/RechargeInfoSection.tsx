import { Clock, Lock, Gift, Lightbulb, Play, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export const RechargeInfoSection = () => {
  const { t } = useLanguage();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-5">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2 flex-wrap">
            {t('recharge.title_pre')} {t('recharge.title_post')}
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </h3>

          <div className="space-y-2 sm:space-y-3">
            <p className="text-sm sm:text-base text-foreground flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-accent flex-shrink-0" />
              <span><strong className="text-accent">{t('recharge.secure')}</strong> • {t('recharge.no_ban')}</span>
            </p>
            <p className="text-sm sm:text-base text-foreground flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                <strong className="text-accent">{t('recharge.bonus')}</strong>{' '}
                <a href="https://central-opus-flow.lovable.app/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">
                  Central Opus Flow
                </a>
              </span>
            </p>
          </div>

          <button
            onClick={() => setVideoOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/30 hover:scale-105 transition-all duration-300"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Veja como funciona
          </button>

          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 inline-flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              {t('recharge.credit_active_pre')} <strong className="text-foreground">{t('recharge.credit_active_bold')}</strong>
            </span>
          </div>
        </div>
      </section>

      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-border/50 bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
            <video
              src="/videos/0403.mp4"
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </>
  );
};
