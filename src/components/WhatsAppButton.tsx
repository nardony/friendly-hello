import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface WhatsAppButtonProps {
  number?: string;
  message?: string;
}

export const WhatsAppButton = ({ number, message }: WhatsAppButtonProps) => {
  const { language } = useLanguage();
  
  if (!number) return null;
  
  const encodedMessage = message ? encodeURIComponent(message) : '';
  const whatsappUrl = `https://wa.me/${number}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  const label = language === 'en' ? 'Support' : 'Suporte';
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 md:bottom-6 md:right-6 bg-whatsapp rounded-full pl-4 pr-3 py-2.5 shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_20px_hsl(var(--whatsapp)_/_0.5)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
    >
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <MessageCircle className="w-6 h-6 text-foreground" fill="currentColor" />
    </a>
  );
};
