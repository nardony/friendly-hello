import { useAppSettings } from '@/hooks/useAppSettings';
import { WhatsAppButton } from './WhatsAppButton';

export const GlobalWhatsAppButton = () => {
  const { settings, loading } = useAppSettings();

  if (loading) return null;

  return (
    <WhatsAppButton 
      number={settings.whatsapp_number || undefined} 
      message={settings.whatsapp_message || undefined} 
    />
  );
};
