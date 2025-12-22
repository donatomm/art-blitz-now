import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    async buildStart() {
      console.log('🗺️ Generating sitemap...');
      
      try {
        const response = await fetch('https://xqubydbsoucrwqhddodw.supabase.co/functions/v1/sitemap');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sitemap: ${response.status}`);
        }
        
        const xml = await response.text();
        const sitemapPath = path.resolve('public/sitemap.xml');
        
        fs.writeFileSync(sitemapPath, xml, 'utf-8');
        console.log('✅ Sitemap generated successfully with', (xml.match(/<url>/g) || []).length, 'URLs');
      } catch (error) {
        console.error('❌ Failed to generate sitemap:', error);
        // Don't fail the build, just warn
      }
    }
  };
}
