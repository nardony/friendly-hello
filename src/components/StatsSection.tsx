import { StatCard } from './StatCard';
import { useLanguage } from '@/hooks/useLanguage';

export const StatsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <StatCard value="1500" label={t('stats.members')} suffix="+" />
          <StatCard value="10000" label={t('stats.credits_min')} suffix="+" />
          <StatCard value="100" label={t('stats.satisfaction')} suffix="%" />
        </div>
      </div>
    </section>
  );
};
