import { staticProducts } from '@/generated/staticProducts';
import { Product } from '@/types/product';

/**
 * Get static products data pre-fetched at build time
 * This enables SSG to render complete product pages with SEO tags
 */
export const getStaticProducts = (): Product[] => {
  return staticProducts as Product[];
};

/**
 * Hook for components that need static products
 * Returns immediately without loading state (data is baked in at build time)
 */
export const useStaticProducts = () => {
  const products = getStaticProducts();
  return { 
    data: products, 
    isLoading: false,
    isError: false,
  };
};

/**
 * Get a single product by slug from static data
 */
export const getStaticProductBySlug = (slug: string): Product | undefined => {
  const products = getStaticProducts();
  return products.find(p => p.slug === slug) || products.find(p => p.id === slug);
};
