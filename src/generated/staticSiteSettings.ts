/**
 * Static site settings data for SSG
 * Auto-generated - DO NOT EDIT MANUALLY
 */

export interface NavItem {
  label: string;
  href: string;
  order?: number;
}

export interface StaticSiteSettings {
  // Hero settings
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_image: string;
  trust_bar_items: string[];
  
  // Navigation settings
  nav_items: NavItem[];
  
  // HelloBar settings
  hellobar_enabled: boolean;
  hellobar_text: string;
  hellobar_text_color: string;
  hellobar_bg_color: string;
  hellobar_bg_opacity: number;
  hellobar_countdown_enabled: boolean;
  hellobar_countdown_end: string;
  hellobar_countdown_text_color: string;
  hellobar_countdown_bg_color: string;
  hellobar_button_enabled: boolean;
  hellobar_button_text: string;
  hellobar_button_text_color: string;
  hellobar_button_bg_color: string;
  hellobar_button_border_color: string;
  hellobar_popup_content: string;
  hellobar_whatsapp_number: string;
  hellobar_contact_email: string;
  
  // Build metadata
  build_timestamp: string;
}

export const staticSiteSettings: StaticSiteSettings = {
  "hero_title": "Opere magnetiche. Uniche. Non per tutti.",
  "hero_subtitle": "Trasforma la tua parete in un'esperienza visiva che cattura lo sguardo e non lo lascia andare.",
  "hero_cta_text": "ESPLORA LA COLLEZIONE",
  "hero_image": "https://xqubydbsoucrwqhddodw.supabase.co/storage/v1/object/public/product-images/hero/herolast.webp",
  "trust_bar_items": ["Stampe Professionali Su Tela", "Tecnologia di stampa HP Latex™ ", "Colori Brillanti Resistenti Alla Luce", "Pronte da Appendere", "Spedizione GRATUITA in ITA (Penisola+Sicilia)"],
  "nav_items": [
    { "label": "Autore", "href": "/artista", "order": 0 },
    { "label": "Spedizione", "href": "/spedizione", "order": 1 },
    { "label": "Prezzi", "href": "/pricing-policy", "order": 2 },
    { "label": "Contatti", "href": "/contatti", "order": 3 },
    { "label": "🟢 FAQs", "href": "/faqs", "order": 4 },
    { "label": "🟢 Polpo: Scienza e Storie incredibili", "href": "/blog", "order": 5 }
  ],
  "hellobar_enabled": true,
  "hellobar_text": "Blog divulgativo: 🟢 >  𝙄𝙡 𝙋𝙤𝙡𝙥𝙤: 𝙎𝙘𝙞𝙚𝙣𝙯𝙖 𝙚d 𝙞𝙣𝙘𝙧𝙚𝙙𝙞𝙗𝙞𝙡𝙞 𝙨𝙩𝙤𝙧𝙞𝙚 𝙫𝙚𝙧𝙚 - E occhio alle offerte fino a -50%",
  "hellobar_text_color": "#FFFFFF",
  "hellobar_bg_color": "#EF4400",
  "hellobar_bg_opacity": 57,
  "hellobar_countdown_enabled": false,
  "hellobar_countdown_end": "2025-12-31T23:59:00",
  "hellobar_countdown_text_color": "#FFEE8C",
  "hellobar_countdown_bg_color": "",
  "hellobar_button_enabled": false,
  "hellobar_button_text": "",
  "hellobar_button_text_color": "#21272B",
  "hellobar_button_bg_color": "#92f2b5",
  "hellobar_button_border_color": "#21272B",
  "hellobar_popup_content": "📦 Spedizione Gratuita\n\nLa spedizione gratuita è valida per:\n\n𝙄𝙩𝙖𝙡𝙞𝙖 𝙋𝙚𝙣𝙞𝙣𝙨𝙪𝙡𝙖𝙧𝙚 𝙚 𝙎𝙞𝙘𝙞𝙡𝙞𝙖\n\nSardegna e isole: €17\n\nPer spedizioni in altri paesi EU , i costi di produzione sono significativamente più alti (diverso fornitore) \n\nPaesi inclusi: DE, AT, CH, LU, GB, IE, FR, BE, ES, SE, DK, FI, NL, PL, PT, CZ, HU, SK.\n\nEXPRESS 24h. Contattami per un preventivo personalizzato.",
  "hellobar_whatsapp_number": "393666295174",
  "hellobar_contact_email": "macudici@gmail.com",
  "build_timestamp": "2026-01-17T02:26:00.000Z"
};

export default staticSiteSettings;
