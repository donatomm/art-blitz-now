# SEO Implementation Documentation

## Overview

This document describes the SEO architecture for OctoWonders, an e-commerce art prints website. The implementation follows modern SEO best practices with dynamic meta tags, structured data, and automated sitemap generation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SEO Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   SEO.tsx    │    │  Sitemap     │    │  robots.txt  │      │
│  │  Component   │    │  Generator   │    │              │      │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘      │
│         │                   │                                   │
│         ▼                   ▼                                   │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │ react-helmet │    │ Edge Function│                          │
│  │    -async    │    │ + Build-time │                          │
│  └──────────────┘    └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. SEO Component (`src/components/SEO.tsx`)

The central SEO component using `react-helmet-async` for dynamic meta tag injection.

#### Features

- **Dynamic titles**: Page-specific titles with brand suffix
- **Meta descriptions**: Custom or default descriptions
- **Open Graph tags**: Full social sharing support
- **Twitter Cards**: Large image card format
- **JSON-LD structured data**: Organization, Product, and WebPage schemas
- **Canonical URLs**: Proper URL canonicalization
- **Noindex support**: For pages that shouldn't be indexed

#### Usage

```tsx
import { SEO } from '@/components/SEO';

// Basic page
<SEO 
  title="Page Title"
  description="Page description for search engines"
  url="/page-path"
/>

// Product page with full schema
<SEO 
  title={product.name}
  description={product.description}
  image={product.image_url}
  url={`/product/${product.slug}`}
  type="product"
  product={product}
/>

// Page that shouldn't be indexed
<SEO 
  title="Admin Panel"
  noindex={true}
/>
```

#### Props Interface

```typescript
interface SEOProps {
  title?: string;           // Page title (appended with site name)
  description?: string;     // Meta description (max 160 chars recommended)
  image?: string;           // OG/Twitter image URL
  url?: string;             // Canonical URL path
  type?: 'website' | 'product' | 'article';
  product?: Product;        // Full product data for schema
  noindex?: boolean;        // Prevent indexing
}
```

### 2. JSON-LD Schema Types

The SEO component generates three types of structured data:

#### Organization Schema (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OctoWonders",
  "url": "https://octowonders.com",
  "logo": "https://octowonders.com/logo.png",
  "description": "Stampe d'arte originali su tela di alta qualità...",
  "founder": {
    "@type": "Person",
    "name": "Marco De Francesco"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "me@octowonders.com",
    "contactType": "customer service"
  }
}
```

#### Product Schema (Product Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://octowonders.com/artworks/product.jpg",
  "brand": {
    "@type": "Brand",
    "name": "OctoWonders"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "59",
    "highPrice": "199",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "offerCount": 4
  }
}
```

#### WebPage Schema (Other Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "description": "Page description",
  "url": "https://octowonders.com/page",
  "isPartOf": {
    "@type": "WebSite",
    "name": "OctoWonders",
    "url": "https://octowonders.com"
  }
}
```

### 3. Sitemap Generation

The project uses a **dual sitemap strategy**:

#### Dynamic Edge Function (`supabase/functions/sitemap/index.ts`)

- Generates XML sitemap on-demand
- Fetches products from Supabase database
- Includes `lastmod` dates from `updated_at` timestamps
- Accessible at: `https://[project-id].supabase.co/functions/v1/sitemap`

```typescript
// Static pages configuration
const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/artista', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contatti', changefreq: 'monthly', priority: '0.6' },
  // ... more pages
];

// Products are added dynamically with:
// - Priority: 0.8
// - Changefreq: weekly
// - Lastmod: from updated_at or current date
```

#### Build-time Generation (`vite-plugin-sitemap.ts`)

- Generates static sitemap during build
- Creates `public/sitemap.xml`
- Uses same static pages + fetches products from Supabase

### 4. Robots.txt (`public/robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://octowonders.com/sitemap.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /api/
```

### 5. Base HTML Meta Tags (`index.html`)

The root HTML file includes:

- Character encoding and viewport
- Default title and description
- Open Graph defaults
- Twitter Card defaults
- Preconnect hints for performance
- DNS prefetch for external domains

## Integration Points

| Component | Responsibility | Updates |
|-----------|---------------|---------|
| `SEO.tsx` | Meta tags, JSON-LD | Per page render |
| Edge Function | Dynamic sitemap | On request |
| Build Plugin | Static sitemap | On deploy |
| `robots.txt` | Crawler directives | Manual |
| `index.html` | Fallback meta | Manual |

## Page-Specific Implementation

### Homepage (`src/pages/Index.tsx`)

```tsx
<SEO />  // Uses defaults for homepage
```

### Product Page (`src/pages/Product.tsx`)

```tsx
<SEO 
  title={product.name}
  description={product.description || `${product.name} - ${product.medium}`}
  image={product.image_url}
  url={`/product/${product.slug}`}
  type="product"
  product={product}
/>
```

### Static Pages (Artist, Contact, etc.)

```tsx
<SEO 
  title="L'Artista"
  description="Scopri Marco De Francesco..."
  url="/artista"
/>
```

## Product Schema Details

The product schema automatically:

1. **Filters active sizes**: Only includes sizes with `price > 0`
2. **Handles deal prices**: Uses `deal_price` when enabled
3. **Calculates price range**: `lowPrice` and `highPrice` from all variants
4. **Absolute URLs**: Converts relative image paths to absolute

```typescript
const getProductSchema = (product: Product) => {
  const activeSizes = product.sizes.filter(s => s.price > 0);
  const prices = activeSizes.map(s => {
    if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
      return s.deal_price;
    }
    return s.price;
  });
  // ...
};
```

## Best Practices Implemented

1. **Single H1 per page**: Enforced in page components
2. **Semantic HTML**: `<header>`, `<main>`, `<section>`, `<article>` used throughout
3. **Image alt attributes**: All images have descriptive alt text
4. **Mobile-first**: Responsive design with proper viewport
5. **Performance**: Preconnect hints, lazy loading where applicable
6. **Clean URLs**: Human-readable slugs for products

## Deployment Workflow

```
Code Push → Build Triggered → Sitemap Generated → Deploy
                                    │
                                    ▼
                         Edge Function Available
                         (real-time sitemap)
```

## Testing SEO

### Validate Structured Data

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Check Meta Tags

- View page source or use browser dev tools
- Use [Meta Tags Debugger](https://metatags.io/)

### Sitemap Validation

- Access `/sitemap.xml` directly
- Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

## Configuration Constants

Located in `src/components/SEO.tsx`:

```typescript
const BASE_URL = 'https://octowonders.com';
const DEFAULT_IMAGE = `${BASE_URL}/artworks/octoheaded.jpg`;
const SITE_NAME = 'OctoWonders';
const BRAND_NAME = 'OctoWonders by Marco De Francesco';
```

## Dependencies

- `react-helmet-async`: ^2.0.5 - Manages document head
- Edge Functions: Deno runtime for sitemap generation
- Supabase: Database for product data
