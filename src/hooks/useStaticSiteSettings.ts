/**
 * SSG-safe hook for site settings
 * In Lovable preview: fetches LIVE data from database
 * In production: returns bundled data synchronously
 */

import { useQuery } from '@tanstack/react-query';
import { staticSiteSettings, StaticSiteSettings } from '@/generated/staticSiteSettings';
import { supabase } from '@/integrations/supabase/client';

// Helper to get setting value with default
const getSetting = (settings: any[], key: string, defaultValue: any) => {
  const setting = settings.find(s => s.key === key);
  return setting?.value ?? defaultValue;
};

export const useStaticSiteSettings = (): StaticSiteSettings => {
  // Always fetch live settings from database (all domains, including production)
  const { data: liveSettings } = useQuery({
    queryKey: ['site-settings-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      
      const settings = data || [];
      return {
        hero_title: getSetting(settings, 'hero_title', 'Arte Originale'),
        hero_subtitle: getSetting(settings, 'hero_subtitle', 'Opere uniche create con passione'),
        hero_cta_text: getSetting(settings, 'hero_cta_text', 'Esplora la Galleria'),
        hero_image: getSetting(settings, 'hero_image', '/placeholder.svg'),
        trust_bar_items: getSetting(settings, 'trust_bar_items', []),
        nav_items: getSetting(settings, 'nav_items', []),
        hellobar_enabled: getSetting(settings, 'hellobar_enabled', false),
        hellobar_text: getSetting(settings, 'hellobar_text', ''),
        hellobar_text_color: getSetting(settings, 'hellobar_text_color', '#FFFFFF'),
        hellobar_bg_color: getSetting(settings, 'hellobar_bg_color', '#000000'),
        hellobar_bg_opacity: getSetting(settings, 'hellobar_bg_opacity', 100),
        hellobar_countdown_enabled: getSetting(settings, 'hellobar_countdown_enabled', false),
        hellobar_countdown_end: getSetting(settings, 'hellobar_countdown_end', ''),
        hellobar_countdown_text_color: getSetting(settings, 'hellobar_countdown_text_color', '#FFFFFF'),
        hellobar_countdown_bg_color: getSetting(settings, 'hellobar_countdown_bg_color', '#FF0000'),
        hellobar_button_enabled: getSetting(settings, 'hellobar_button_enabled', false),
        hellobar_button_text: getSetting(settings, 'hellobar_button_text', ''),
        hellobar_button_text_color: getSetting(settings, 'hellobar_button_text_color', '#000000'),
        hellobar_button_bg_color: getSetting(settings, 'hellobar_button_bg_color', '#FFFFFF'),
        hellobar_button_border_color: getSetting(settings, 'hellobar_button_border_color', '#FFFFFF'),
        hellobar_popup_content: getSetting(settings, 'hellobar_popup_content', ''),
        hellobar_whatsapp_number: getSetting(settings, 'hellobar_whatsapp_number', ''),
        hellobar_contact_email: getSetting(settings, 'hellobar_contact_email', ''),
        build_timestamp: new Date().toISOString(),
      } as StaticSiteSettings;
    },
    enabled: true,
    staleTime: 30_000,
    gcTime: 0,
    refetchOnMount: 'always',
  });
  
  // Live data when available, static as fallback (first paint + DB unreachable)
  return liveSettings ?? staticSiteSettings;
};

export default useStaticSiteSettings;
