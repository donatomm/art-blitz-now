import { lazy, Suspense } from "react";
import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./components/RootLayout";

// Static data for SSG (committed TypeScript files with data)
import { staticProducts } from "@/generated/staticProducts";
import { staticPages } from "@/generated/staticPages";

// Critical path - load immediately for SSG (not lazy loaded)
import Index from "./pages/Index";
import Product from "./pages/Product";
import CMSPage from "./pages/CMSPage";

// Lazy-loaded pages (special pages not from CMS)
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Contact = lazy(() => import("./pages/Contact"));

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

// Get CMS page slugs that have special handling (won't use generic CMSPage)
const specialPageSlugs = ['contatti']; // Contact has custom children

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
        element: <Product />,
        // Entry helps vite-react-ssg find styles/assets for this route
        entry: "src/pages/Product.tsx",
        // Use pre-fetched static products TS for SSG paths
        getStaticPaths: () => {
          const paths = staticProducts
            .filter(p => p.slug && p.is_active !== false)
            .map(p => `product/${p.slug}`);
          console.log('[SSG] Product paths:', paths.length);
          return paths;
        },
      },
      // Special pages that need custom handling
      {
        path: "cookies",
        element: withSuspense(Cookies),
        getStaticPaths: () => ["cookies"],
      },
      {
        path: "contact",
        element: withSuspense(Contact),
        getStaticPaths: () => ["contact"],
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
        path: "checkout/success",
        element: withSuspense(CheckoutSuccess),
        getStaticPaths: () => ["checkout/success"],
      },
      // Dynamic CMS pages - all pages from database
      // Slug mapping: database slug -> URL path (e.g., "artista" -> /artista)
      {
        path: ":slug",
        element: <CMSPage />,
        entry: "src/pages/CMSPage.tsx",
        getStaticPaths: () => {
          // Filter out pages that have special handling
          const paths = staticPages
            .filter(p => !specialPageSlugs.includes(p.slug))
            .map(p => p.slug);
          console.log('[SSG] CMS page paths:', paths);
          return paths;
        },
      },
      {
        path: "*",
        element: withSuspense(NotFound),
      },
    ],
  },
];
