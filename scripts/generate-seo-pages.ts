/**
 * This script fetches products from Supabase and generates static HTML files
 * for each product page with proper SEO meta tags.
 * 
 * Run with: npx tsx scripts/generate-seo-pages.ts
 */

const SUPABASE_URL = "https://xqubydbsoucrwqhddodw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWJ5ZGJzb3VjcndxaGRkb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3MTEsImV4cCI6MjA4MDQxMzcxMX0.gf9hyzaMNAolSwlmUzVlkpopoM24jWiyiGuGsL5REnI";
const BASE_URL = "https://octowonders.com";
const SITE_NAME = "OctoWonders";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  medium: string;
  image_url: string;
  sizes: Array<{
    price: number;
    deal_price?: number;
    dimensions: string;
    deal_label_enabled?: boolean;
  }>;
  is_active: boolean;
}

function getProductSchema(product: Product) {
  const activeSizes = product.sizes.filter(s => s.price > 0);
  const prices = activeSizes.map(s => {
    if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
      return s.deal_price;
    }
    return s.price;
  });
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - ${product.medium}`,
    "image": product.image_url,
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": lowPrice.toString(),
      "highPrice": highPrice.toString(),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "offerCount": activeSizes.length
    }
  };
}

function generateProductHTML(product: Product): string {
  const activeSizes = product.sizes.filter(s => s.price > 0);
  const prices = activeSizes.map(s => {
    if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
      return s.deal_price;
    }
    return s.price;
  });
  const minPrice = Math.min(...prices);

  const title = `${product.name} | ${SITE_NAME}`;
  const description = product.description 
    ? product.description.substring(0, 160).replace(/"/g, '&quot;')
    : `${product.name} - ${product.medium}. Stampa su tela di alta qualità. Da €${minPrice}. Spedizione gratuita in Italia.`;
  const canonicalUrl = `${BASE_URL}/product/${product.slug}`;
  const imageUrl = product.image_url;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="author" content="Marco De Francesco">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="it_IT">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(getProductSchema(product), null, 2)}
  </script>
  
  <!-- Client-side app will hydrate -->
  <script type="module" src="/src/main.tsx"></script>
  <link rel="stylesheet" href="/src/index.css">
</head>
<body>
  <div id="root">
    <!-- SEO fallback content for crawlers -->
    <article>
      <h1>${product.name}</h1>
      <p>${product.medium}</p>
      <p>${description}</p>
      <p>Prezzo: da €${minPrice}</p>
      <img src="${imageUrl}" alt="${product.name} - ${product.medium} - Stampa d'arte su tela OctoWonders" loading="lazy">
      <a href="${canonicalUrl}">Acquista ${product.name}</a>
    </article>
  </div>
</body>
</html>`;
}

async function main() {
  console.log("🔄 Fetching products from Supabase...");
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*&is_active=eq.true&order=display_order.asc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const products = await response.json() as Product[];
  console.log(`✅ Found ${products.length} active products`);

  const fs = await import('fs');
  const path = await import('path');

  // Create product directory
  const productDir = path.join(process.cwd(), 'public', 'product');
  fs.mkdirSync(productDir, { recursive: true });

  // Generate HTML for each product
  for (const product of products) {
    if (!product.slug) {
      console.log(`⏭️ Skipping ${product.name} - no slug`);
      continue;
    }

    const html = generateProductHTML(product);
    const filePath = path.join(productDir, `${product.slug}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`📝 Generated: ${filePath}`);
  }

  console.log(`\n✅ Generated ${products.filter(p => p.slug).length} product pages`);
}

main().catch(console.error);
