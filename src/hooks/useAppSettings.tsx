import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  whatsapp_number: string | null;
  whatsapp_message: string | null;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    whatsapp_number: null,
    whatsapp_message: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: AppSettings = {
        whatsapp_number: null,
        whatsapp_message: null,
      };

      data?.forEach((item) => {
        if (item.key === 'whatsapp_number') {
          settingsMap.whatsapp_number = item.value;
        } else if (item.key === 'whatsapp_message') {
          settingsMap.whatsapp_message = item.value;
        }
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating setting:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, updateSetting, refetch: fetchSettings };
};
