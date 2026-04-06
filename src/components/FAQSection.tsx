import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
}

const defaultFaqs: FAQItem[] = [
  { question: "Como funciona para gerar os créditos?", answer: "É bem simples! Tudo feito pelo workspace, enviaremos um email após o pagamento e um vídeo ensinando pelo WhatsApp." },
  { question: "Convite Automático", answer: "Convide nosso bot como editor no seu workspace Lovable. O sistema detecta automaticamente. Após o convite, acesse https://lovable.dev/settings/people e altere a permissão do bot para OWNER." },
  { question: "Créditos Gerados", answer: "Os créditos são gerados e injetados no seu workspace automaticamente. Acompanhe em tempo real." },
  { question: "Como eu sei se funciona mesmo e não é golpe?", answer: "Você pode pedir para nós enviarmos créditos para você para que você veja os resultados e o funcionamento por conta própria." },
  { question: "Está funcionando depois da atualização do Lovable?", answer: "Método atualizado em 02/04/2026." },
  { question: "Funciona em uma conta que já indicou mais de 10 convites?", answer: "Sim! Você pode resgatar créditos em uma conta que já indicou mais de 10 pessoas, desde que você tenha acesso a uma conta que já resgatou créditos nessa conta, então você pode depositar na conta desejada." },
];

export const FAQSection = ({ title, subtitle, items }: FAQSectionProps) => {
  const displayTitle = title || 'Como funciona a recarga de créditos?';
  const displaySubtitle = subtitle || 'Tudo você precisa para usar a Lovable sem preocupações.';
  const faqs = items && items.length > 0 ? items : defaultFaqs;

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {displayTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            {displaySubtitle}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg sm:rounded-xl px-4 sm:px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left hover:no-underline py-3 sm:py-4">
                <span className="text-sm sm:text-base text-foreground font-medium pr-2">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-3 sm:pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
