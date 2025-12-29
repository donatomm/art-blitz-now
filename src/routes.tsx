import { lazy, Suspense } from "react";
import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./components/RootLayout";

// Static products data for SSG (committed TypeScript file with product data)
import { staticProducts } from "@/generated/staticProducts";

// Critical path - load immediately (required for SSG head tags)
import Index from "./pages/Index";
// Use ProductSeo for SSG-safe meta tags, it lazy-loads full Product on client
import ProductSeo from "./pages/ProductSeo";
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
        element: <ProductSeo />,
        // Use pre-fetched static products TS for SSG paths
        getStaticPaths: () => {
          return staticProducts
            .filter(p => p.slug && p.is_active !== false)
            .map(p => `product/${p.slug}`);
        },
      },
      {
        path: "artist",
        element: withSuspense(Artist),
        // Explicitly mark for prerendering
        getStaticPaths: () => ["artist"],
      },
      {
        path: "shipping",
        element: withSuspense(Shipping),
        getStaticPaths: () => ["shipping"],
      },
      {
        path: "pricing-policy",
        element: withSuspense(PricingPolicy),
        getStaticPaths: () => ["pricing-policy"],
      },
      {
        path: "contact",
        element: withSuspense(Contact),
        getStaticPaths: () => ["contact"],
      },
      {
        path: "checkout/success",
        element: withSuspense(CheckoutSuccess),
        getStaticPaths: () => ["checkout/success"],
      },
      {
        path: "privacy",
        element: withSuspense(Privacy),
        getStaticPaths: () => ["privacy"],
      },
      {
        path: "cookies",
        element: withSuspense(Cookies),
        getStaticPaths: () => ["cookies"],
      },
      {
        path: "terms",
        element: withSuspense(Terms),
        getStaticPaths: () => ["terms"],
      },
      {
        path: "resi-rimborsi",
        element: withSuspense(ResiRimborsi),
        getStaticPaths: () => ["resi-rimborsi"],
      },
      {
        path: "ordine-personalizzato",
        element: withSuspense(OrdinePersonalizzato),
        getStaticPaths: () => ["ordine-personalizzato"],
      },
      {
        path: "colors",
        element: withSuspense(ColorPalette),
        getStaticPaths: () => ["colors"],
      },
      {
        path: "sitemap",
        element: withSuspense(Sitemap),
        getStaticPaths: () => ["sitemap"],
      },
      {
        path: "*",
        element: withSuspense(NotFound),
      },
    ],
  },
];
