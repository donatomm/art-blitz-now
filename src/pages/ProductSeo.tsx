import { useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { lazy, Suspense, useEffect, useState } from "react";
import { staticProducts } from "@/generated/staticProducts";
import type { Product } from "@/types/product";

// Lazy load the full interactive Product component for client-side
const ProductFull = lazy(() => import("./Product"));

// Get product from static data (SSG-safe, no hooks)
const getProductBySlug = (slug: string): Product | undefined => {
  return staticProducts.find((p) => p.slug === slug) as Product | undefined;
};

// Generate JSON-LD schema for product
const getProductSchema = (product: Product) => {
  const sizes = product.sizes || [];
  const prices = sizes.map((s) => s.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - Stampa su tela di alta qualità`,
    image: product.image_url?.startsWith("http")
      ? product.image_url
      : `https://octowonders.com${product.image_url}`,
    brand: {
      "@type": "Brand",
      name: "OctoWonders",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: sizes.length,
      availability: "https://schema.org/InStock",
    },
  };
};

export default function ProductSeo() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [isClient, setIsClient] = useState(false);

  // Detect client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get product from static data (works during SSG)
  const product = getProductBySlug(slug);

  // On client-side, render the full interactive Product component
  if (isClient) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-pulse text-muted-foreground">Caricamento...</div>
          </div>
        }
      >
        <ProductFull />
      </Suspense>
    );
  }

  // During SSG: render minimal SEO shell
  if (!product) {
    return (
      <>
        <Head>
          <title>Prodotto non trovato | OctoWonders</title>
          <meta name="robots" content="noindex" />
        </Head>
        <main>
          <h1>Prodotto non trovato</h1>
        </main>
      </>
    );
  }

  const canonical = `https://octowonders.com/product/${product.slug || product.id}`;
  const title = `${product.name} | OctoWonders`;
  const description = (
    product.description ||
    `${product.name} - Stampa su tela di alta qualità. Spedizione gratuita in Italia.`
  )
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .trim()
    .slice(0, 160);

  const imageUrl = product.image_url?.startsWith("http")
    ? product.image_url
    : `https://octowonders.com${product.image_url}`;

  return (
    <>
      <Head>
        {/* Basic Meta */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="OctoWonders" />
        <meta property="og:locale" content="it_IT" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(getProductSchema(product))}
        </script>
      </Head>

      {/* Minimal semantic HTML for crawlers */}
      <main itemScope itemType="https://schema.org/Product">
        <article>
          <h1 itemProp="name">{product.name}</h1>
          {product.description && (
            <p itemProp="description">
              {product.description.replace(/<[^>]*>/g, "").slice(0, 300)}
            </p>
          )}
          {product.image_url && (
            <img
              src={imageUrl}
              alt={product.name}
              itemProp="image"
              loading="lazy"
            />
          )}
          <meta itemProp="brand" content="OctoWonders" />
        </article>
      </main>
    </>
  );
}
