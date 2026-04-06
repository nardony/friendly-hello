import { CreditCard, LogIn, Sparkles, Rocket } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const StepCard = ({ number, icon: Icon, title, description, isFirst }: { number: string; icon: any; title: string; description: string; isFirst?: boolean }) => {
  return (
    <div className={`relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 ${isFirst ? 'border-primary/50' : ''}`}>
      <span className="text-2xl sm:text-4xl font-bold text-primary/30 mb-2 sm:mb-4 block">{number}</span>
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      </div>
      <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    { number: "01", icon: CreditCard, title: t('how.step1_title'), description: t('how.step1_desc') },
    { number: "02", icon: LogIn, title: t('how.step2_title'), description: t('how.step2_desc') },
    { number: "03", icon: Sparkles, title: t('how.step3_title'), description: t('how.step3_desc') },
    { number: "04", icon: Rocket, title: t('how.step4_title'), description: t('how.step4_desc') },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {t('how.title_pre')} <span className="text-primary">{t('how.title_highlight')}</span>?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('how.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, index) => (
            <StepCard key={index} number={step.number} icon={step.icon} title={step.title} description={step.description} isFirst={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
};
