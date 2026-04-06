import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const getTimeLeftUntilEndOfDay = (): TimeLeft => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));
  return {
    hours: Math.floor(diff / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
};

const getTimeLeftUntilDeadline = (deadline: string): TimeLeft => {
  const now = new Date();
  const target = new Date(deadline);
  const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    hours: Math.floor(diff / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
};

export const CountdownTimer = () => {
  const { settings } = useHomepageSettings();
  const { hero } = settings;
  const mode = hero.countdown_mode || 'end_of_day';
  const deadline = hero.countdown_deadline;

  const getTimeLeft = () => {
    if (mode === 'custom' && deadline) {
      return getTimeLeftUntilDeadline(deadline);
    }
    return getTimeLeftUntilEndOfDay();
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, deadline]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const navigate = useNavigate();

  return (
    <div 
      className="inline-flex items-center gap-1.5 sm:gap-2 bg-card/80 border border-border/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm cursor-pointer hover:bg-card/90 hover:border-primary/30 transition-all"
      onClick={() => navigate('/authrevenda')}
    >
      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
      <span className="text-xs sm:text-sm text-muted-foreground">{t('hero.expires_in')}</span>
      <div className="bg-muted rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1">
        <span className="text-xs sm:text-sm font-mono font-bold text-foreground">
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};
