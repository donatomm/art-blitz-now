/**
 * Static pages access for SSG
 * Uses build-time fetched pages for initial render, avoiding loading skeletons for crawlers
 */

import { staticPages } from '@/generated/staticPages';
import { Page } from '@/hooks/usePages';

/**
 * Get all static pages (fetched at build time)
 */
export const getStaticPages = (): Page[] => staticPages;

/**
 * Get a single static page by slug
 * Case-insensitive matching for flexibility
 */
export const getStaticPageBySlug = (slug: string): Page | undefined => {
  return staticPages.find(p => 
    p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase()
  );
};

export default staticPages;
