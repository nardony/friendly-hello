import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const defaultGuaranteeItems_pt = [
  "Garantimos a entrega e funcionamento do produto no momento da liberação.",
  "Caso ocorra reset de créditos e a plataforma ainda permita novas adições, realizamos a reposição por até 15 dias após a recarga.",
  "O prazo de 15 dias refere-se à garantia de entrega e funcionamento inicial.",
];

const defaultGuaranteeItems_en = [
  "We guarantee the delivery and functioning of the product at the time of release.",
  "If a credit reset occurs and the platform still allows new additions, we provide replacement for up to 15 days after the recharge.",
  "The 15-day period refers to the delivery and initial operation guarantee.",
];

interface GuaranteeSectionProps {
  title?: string;
  items?: string[];
}

export const GuaranteeSection = ({ title, items }: GuaranteeSectionProps) => {
  const { language } = useLanguage();
  const displayTitle = language === 'en' ? 'Guarantee' : (title || 'Garantia');
  const defaultItems = language === 'en' ? defaultGuaranteeItems_en : defaultGuaranteeItems_pt;
  const displayItems = (language === 'pt' && items && items.length > 0) ? items : defaultItems;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-foreground">{displayTitle}</h3>
          </div>
          <ul className="space-y-3">
            {displayItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
