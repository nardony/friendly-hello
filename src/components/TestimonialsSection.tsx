import { Star, Clock, ThumbsUp, Zap } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const testimonials_pt = [
  { id: 1, email: "mn***@gmail.com", credits: 100, text: "Experiência incrível, recarrega de forma rápida os créditos. Parabéns a equipe que desenvolveu o Lovable Credits :)" },
  { id: 2, email: "ad***@leieimici.online", credits: 200, text: "Isso aqui é surreal de bom" },
  { id: 3, email: "bl***@gmail.com", credits: 400, text: "Muito obrigado pelo exelente trabalho" },
  { id: 4, email: "co***@leigosacademy.site", credits: 100, text: "Foi top 🔥 gostei de compra mais barato" },
  { id: 5, email: "bu***@gmail.com", credits: 300, text: "gostei foi bem rapido e super pratico recomendo" },
  { id: 6, email: "bu***@gmail.com", credits: 100, text: "os melhores do mercado de creditos do lovable...rapido e pratico" },
  { id: 7, email: "ra***@hotmail.com", credits: 200, text: "Sensacional, recebi os créditos em menos de 5 minutos!" },
  { id: 8, email: "le***@outlook.com", credits: 150, text: "Melhor custo-benefício que já encontrei, super recomendo" },
  { id: 9, email: "jo***@gmail.com", credits: 500, text: "Já comprei 3 vezes, sempre rápido e confiável 💯" },
  { id: 10, email: "pe***@yahoo.com", credits: 100, text: "Atendimento excelente, tiraram todas as dúvidas" },
  { id: 11, email: "ca***@gmail.com", credits: 250, text: "Processo super simples, até minha avó conseguiria fazer kk" },
  { id: 12, email: "ma***@proton.me", credits: 1000, text: "Comprei o pacote maior e valeu muito a pena, preço justo" },
];

const testimonials_en = [
  { id: 1, email: "mn***@gmail.com", credits: 100, text: "Incredible experience, recharges credits quickly. Congrats to the team that developed Lovable Credits :)" },
  { id: 2, email: "ad***@leieimici.online", credits: 200, text: "This is unbelievably good" },
  { id: 3, email: "bl***@gmail.com", credits: 400, text: "Thank you so much for the excellent work" },
  { id: 4, email: "co***@leigosacademy.site", credits: 100, text: "It was great 🔥 loved buying it cheaper" },
  { id: 5, email: "bu***@gmail.com", credits: 300, text: "loved it, very fast and super practical, I recommend it" },
  { id: 6, email: "bu***@gmail.com", credits: 100, text: "the best in the lovable credits market...fast and practical" },
  { id: 7, email: "ra***@hotmail.com", credits: 200, text: "Amazing, received credits in less than 5 minutes!" },
  { id: 8, email: "le***@outlook.com", credits: 150, text: "Best value I've ever found, highly recommend" },
  { id: 9, email: "jo***@gmail.com", credits: 500, text: "Bought 3 times already, always fast and reliable 💯" },
  { id: 10, email: "pe***@yahoo.com", credits: 100, text: "Excellent support, answered all my questions" },
  { id: 11, email: "ca***@gmail.com", credits: 250, text: "Super simple process, anyone can do it" },
  { id: 12, email: "ma***@proton.me", credits: 1000, text: "Bought the biggest package and it was totally worth it" },
];

const timeUnits_pt = ["min", "h"];
const timeUnits_en = ["min ago", "h ago"];

function generateTimeAgo(language: string): string {
  const rand = Math.random();
  if (rand < 0.5) {
    const mins = Math.floor(Math.random() * 55) + 5;
    return language === 'en' ? `${mins} ${timeUnits_en[0]}` : `há ${mins} ${timeUnits_pt[0]}`;
  }
  const hours = Math.floor(Math.random() * 23) + 1;
  return language === 'en' ? `${hours} ${timeUnits_en[1]}` : `há ${hours} ${timeUnits_pt[1]}`;
}

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const TestimonialsSection = () => {
  const { t, language } = useLanguage();
  const allTestimonials = language === 'en' ? testimonials_en : testimonials_pt;

  const [visibleSet, setVisibleSet] = useState(() => shuffleAndPick(allTestimonials, 6));
  const [timeAgos, setTimeAgos] = useState<string[]>(() =>
    Array.from({ length: 6 }, () => generateTimeAgo(language))
  );

  // Rotate testimonials every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSet(shuffleAndPick(allTestimonials, 6));
      setTimeAgos(Array.from({ length: 6 }, () => generateTimeAgo(language)));
    }, 15000);
    return () => clearInterval(interval);
  }, [allTestimonials, language]);

  const reviewCount = useMemo(() => 230 + Math.floor(Math.random() * 20), []);

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {t('testimonials.title')}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-foreground">100%</span>
            <span className="text-muted-foreground">{t('testimonials.positive')}</span>
            <span className="text-muted-foreground">({reviewCount} {t('testimonials.reviews')})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visibleSet.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 hover:border-primary/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-sm font-medium text-foreground">{testimonial.email}</span>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgos[index]}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  <ThumbsUp className="w-3 h-3" />
                  {t('testimonials.recommends')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-foreground">{testimonial.credits} {t('testimonials.credits')}</span>
              </div>

              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
