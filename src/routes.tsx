import { lazy, Suspense } from "react";
import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./components/RootLayout";

// Critical path - load immediately
import Index from "./pages/Index";

// Lazy load secondary pages for smaller initial bundle
const Product = lazy(() => import("./pages/Product"));
const Artist = lazy(() => import("./pages/Artist"));
const Shipping = lazy(() => import("./pages/Shipping"));
const PricingPolicy = lazy(() => import("./pages/PricingPolicy"));
const Contact = lazy(() => import("./pages/Contact"));

const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Terms = lazy(() => import("./pages/Terms"));
const ResiRimborsi = lazy(() => import("./pages/ResiRimborsi"));
const OrdinePersonalizzato = lazy(() => import("./pages/OrdinePersonalizzato"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));
const Sitemap = lazy(() => import("./pages/Sitemap"));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Caricamento...</div>
  </div>
);

// Wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "product/:slug",
        element: withSuspense(Product),
        // Fetch all product slugs at build time for prerendering
        getStaticPaths: async () => {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xqubydbsoucrwqhddodw.supabase.co";
          const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWJ5ZGJzb3VjcndxaGRkb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3MTEsImV4cCI6MjA4MDQxMzcxMX0.gf9hyzaMNAolSwlmUzVlkpopoM24jWiyiGuGsL5REnI";
          
          try {
            const response = await fetch(
              `${supabaseUrl}/rest/v1/products?select=slug&is_active=eq.true`,
              {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              }
            );
            
            if (!response.ok) {
              console.error("Failed to fetch product slugs for SSG");
              return [];
            }
            
            const products = await response.json();
            return products
              .filter((p: { slug: string | null }) => p.slug)
              .map((p: { slug: string }) => `product/${p.slug}`);
          } catch (error) {
            console.error("Error fetching product slugs for SSG:", error);
            return [];
          }
        },
      },
      {
        path: "artist",
        element: withSuspense(Artist),
      },
      {
        path: "shipping",
        element: withSuspense(Shipping),
      },
      {
        path: "pricing-policy",
        element: withSuspense(PricingPolicy),
      },
      {
        path: "contact",
        element: withSuspense(Contact),
      },
      {
        path: "checkout/success",
        element: withSuspense(CheckoutSuccess),
      },
      {
        path: "privacy",
        element: withSuspense(Privacy),
      },
      {
        path: "cookies",
        element: withSuspense(Cookies),
      },
      {
        path: "terms",
        element: withSuspense(Terms),
      },
      {
        path: "resi-rimborsi",
        element: withSuspense(ResiRimborsi),
      },
      {
        path: "ordine-personalizzato",
        element: withSuspense(OrdinePersonalizzato),
      },
      {
        path: "colors",
        element: withSuspense(ColorPalette),
      },
      {
        path: "sitemap",
        element: withSuspense(Sitemap),
      },
      {
        path: "*",
        element: withSuspense(NotFound),
      },
    ],
  },
];
