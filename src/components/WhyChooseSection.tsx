import { Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const BenefitItem = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-3 sm:px-5 py-2 sm:py-3">
      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
      </div>
      <span className="text-foreground text-xs sm:text-sm">{text}</span>
    </div>
  );
};

export const WhyChooseSection = () => {
  const { t } = useLanguage();

  const benefits = [
    { left: t('why.b1'), right: t('why.b2') },
    { left: t('why.b3'), right: t('why.b4') },
    { left: t('why.b5'), right: t('why.b6') },
    { left: t('why.b7'), right: t('why.b8') },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {t('why.title_pre')} <span className="text-primary">{t('why.title_highlight')}</span> {t('why.title_post')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            {t('why.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {benefits.map((row, index) => (
            <div key={index} className="contents">
              <BenefitItem text={row.left} />
              <BenefitItem text={row.right} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
