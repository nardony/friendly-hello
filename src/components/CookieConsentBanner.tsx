import { useState, useEffect } from 'react';
import { Shield, Cookie, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [userIp, setUserIp] = useState<string>('');
  const { t } = useLanguage();

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => setUserIp(data.ip))
        .catch(() => setUserIp('N/A'));
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom-full duration-500">
      <div className="bg-card/95 backdrop-blur-md border-t border-border shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Cookie className="w-4 h-4" />
                  {t('cookie.title')}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('cookie.description')}{' '}
                  <Link to="/privacidade" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                    {t('cookie.lgpd')}
                  </Link>
                  . {t('cookie.continue')}{' '}
                  <Link to="/privacidade" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                    {t('cookie.privacy')}
                  </Link>{' '}
                  {t('cookie.and')}{' '}
                  <Link to="/termos" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                    {t('cookie.terms')}
                  </Link>.
                </p>
                {userIp && (
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-1">
                    <Wifi className="w-3 h-3" />
                    {t('cookie.your_ip')}: <span className="font-mono">{userIp}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="text-xs flex-1 sm:flex-initial"
              >
                {t('cookie.essential_only')}
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="text-xs flex-1 sm:flex-initial"
              >
                {t('cookie.accept_all')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
