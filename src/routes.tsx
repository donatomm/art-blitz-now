import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./components/RootLayout";

// Static data for SSG (committed TypeScript files with data)
import { staticProducts } from "@/generated/staticProducts";
import { staticPages } from "@/generated/staticPages";

// Critical path - load immediately for SSG (not lazy loaded)
import Index from "./pages/Index";
import Product from "./pages/Product";
import CMSPage from "./pages/CMSPage";
import NestedCMSPage from "./pages/NestedCMSPage";

// Lazy-loaded pages (special pages not from CMS)
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Contact = lazy(() => import("./pages/Contact"));
const ImageRename = lazy(() => import("./pages/ImageRename"));
const ImageRenamerTool = lazy(() => import("./pages/ImageRenamerTool"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

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
        path: "contatti",
        element: withSuspense(Contact),
        getStaticPaths: () => ["contatti"],
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
      {
        path: "image-rename",
        element: withSuspense(ImageRename),
      },
      {
        path: "image-rename-tool",
        element: withSuspense(ImageRenamerTool),
      },
      {
        path: ".lovable/oauth/consent",
        element: withSuspense(OAuthConsent),
      },

      // Legacy URL redirects (for external links, bookmarks, search engines)
      {
        path: "artist",
        element: <Navigate to="/artista" replace />,
      },
      {
        path: "contact",
        element: <Navigate to="/contatti" replace />,
      },
      {
        path: "shipping",
        element: <Navigate to="/spedizione" replace />,
      },
      {
        path: "resi-e-rimborsi",
        element: <Navigate to="/resi-rimborsi" replace />,
      },
      {
        path: "Octopus-Facts",
        element: <Navigate to="/storie-fatti-scientifici-polpo" replace />,
      },
      // Dynamic CMS pages - single segment slugs (e.g., "artista")
      {
        path: ":slug",
        element: <CMSPage />,
        entry: "src/pages/CMSPage.tsx",
        getStaticPaths: () => {
          // Filter out pages that have special handling or nested paths
          const paths = staticPages
            .filter(p => !specialPageSlugs.includes(p.slug) && !p.slug.includes('/'))
            .map(p => p.slug);
          console.log('[SSG] CMS page paths (single):', paths);
          return paths;
        },
      },
      // Nested CMS pages - two segment slugs (e.g., "blog/article-title")
      {
        path: ":category/:slug",
        element: <NestedCMSPage />,
        entry: "src/pages/NestedCMSPage.tsx",
        getStaticPaths: () => {
          // Only pages with nested paths like "blog/article"
          const paths = staticPages
            .filter(p => p.slug.includes('/'))
            .map(p => p.slug);
          console.log('[SSG] CMS page paths (nested):', paths);
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
