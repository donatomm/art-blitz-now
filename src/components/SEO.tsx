import { Head } from 'vite-react-ssg';
import { Product } from '@/types/product';

interface Breadcrumb {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: Product;
  noindex?: boolean;
  breadcrumbs?: Breadcrumb[];
}

const BASE_URL = 'https://octowonders.com';
const DEFAULT_IMAGE = `${BASE_URL}/artworks/octoheaded.jpg`;
const SITE_NAME = 'OctoWonders';
const BRAND_NAME = 'OctoWonders by Marco De Francesco';

// Generate JSON-LD for Organization (homepage)
const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: "Stampe d'arte originali su tela di alta qualità. Opere uniche a tema marino.",
  founder: {
    '@type': 'Person',
    name: 'Marco De Francesco',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'me@octowonders.com',
    contactType: 'customer service',
  },
});

// Generate JSON-LD for Product
const getProductSchema = (product: Product) => {
  const activeSizes = product.sizes.filter(s => s.price > 0);
  const prices = activeSizes.map(s => {
    if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
      return s.deal_price;
    }
    return s.price;
  });
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  // Get absolute image URL
  const imageUrl = product.image_url.startsWith('http') 
    ? product.image_url 
    : `${BASE_URL}${product.image_url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - ${product.medium}. Stampa su tela di alta qualità.`,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: lowPrice.toString(),
      highPrice: highPrice.toString(),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      offerCount: activeSizes.length,
    },
  };
};

// Generate JSON-LD for WebPage
const getWebPageSchema = (title: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
  },
});

// Generate JSON-LD for BreadcrumbList
const getBreadcrumbSchema = (breadcrumbs: Breadcrumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
  })),
});

export const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  product,
  noindex = false,
  breadcrumbs,
}: SEOProps) => {
  // Build full title
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}` 
    : `${BRAND_NAME} - Stampe d'Arte su Tela`;

  // Default description
  const metaDescription = description || 
    "Stampe d'arte originali su tela di alta qualità. Opere uniche a tema marino. Spedizione gratuita in Italia.";

  // Image URL
  const metaImage = image || DEFAULT_IMAGE;
  const absoluteImage = metaImage.startsWith('http') ? metaImage : `${BASE_URL}${metaImage}`;

  // URL
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  // Determine JSON-LD schema
  let jsonLd;
  if (product) {
    jsonLd = getProductSchema(product);
  } else if (type === 'website' && !url) {
    jsonLd = getOrganizationSchema();
  } else {
    jsonLd = getWebPageSchema(fullTitle, metaDescription, canonicalUrl);
  }

  return (
    <Head>
      {/* Language */}
      <html lang="it" />
      
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="it_IT" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* Breadcrumb Structured Data */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema(breadcrumbs))}
        </script>
      )}
    </Head>
  );
};

export default SEO;
