import { Monitor, LayoutGrid, Infinity } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Monitor, title: t('features.simple_interface'), description: t('features.simple_interface_desc') },
    { icon: LayoutGrid, title: t('features.automated'), description: t('features.automated_desc') },
    { icon: Infinity, title: t('features.unlimited'), description: t('features.unlimited_desc') },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {t('features.section_title')} <span className="text-primary">{t('features.section_title_highlight')}</span>?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            {t('features.section_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
};
