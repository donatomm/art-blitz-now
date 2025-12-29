import type { RouteRecord } from "vite-react-ssg";
import RootLayout from "./components/RootLayout";
import Index from "./pages/Index";
import ProductSeo from "./pages/ProductSeo";
import { staticProducts } from "@/generated/staticProducts";

// Helper: make React Router lazy modules work even if the page exports default
const lazyPage = (importer: () => Promise<any>) => {
  return async () => {
    const mod = await importer();
    const Component = mod.default ?? mod.Component;
    return { Component };
  };
};

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Index />,
        // Optional but explicit
        getStaticPaths: () => ["/"],
      },

      // ✅ Product route: keep ProductSeo as a normal element (SSG-safe)
      {
        path: "product/:slug",
        element: <ProductSeo />,
        getStaticPaths: () =>
          staticProducts
            .filter((p) => p.slug && p.is_active !== false)
            .map((p) => `product/${p.slug}`),
      },

      // ✅ All other pages: use route.lazy (NOT React.lazy + Suspense)
      {
        path: "artist",
        lazy: lazyPage(() => import("./pages/Artist")),
        getStaticPaths: () => ["artist"],
      },
      {
        path: "shipping",
        lazy: lazyPage(() => import("./pages/Shipping")),
        getStaticPaths: () => ["shipping"],
      },
      {
        path: "pricing-policy",
        lazy: lazyPage(() => import("./pages/PricingPolicy")),
        getStaticPaths: () => ["pricing-policy"],
      },
      {
        path: "contact",
        lazy: lazyPage(() => import("./pages/Contact")),
        getStaticPaths: () => ["contact"],
      },
      {
        path: "checkout/success",
        lazy: lazyPage(() => import("./pages/CheckoutSuccess")),
        getStaticPaths: () => ["checkout/success"],
      },
      {
        path: "privacy",
        lazy: lazyPage(() => import("./pages/Privacy")),
        getStaticPaths: () => ["privacy"],
      },
      {
        path: "cookies",
        lazy: lazyPage(() => import("./pages/Cookies")),
        getStaticPaths: () => ["cookies"],
      },
      {
        path: "terms",
        lazy: lazyPage(() => import("./pages/Terms")),
        getStaticPaths: () => ["terms"],
      },
      {
        path: "resi-rimborsi",
        lazy: lazyPage(() => import("./pages/ResiRimborsi")),
        getStaticPaths: () => ["resi-rimborsi"],
      },
      {
        path: "ordine-personalizzato",
        lazy: lazyPage(() => import("./pages/OrdinePersonalizzato")),
        getStaticPaths: () => ["ordine-personalizzato"],
      },
      {
        path: "colors",
        lazy: lazyPage(() => import("./pages/ColorPalette")),
        getStaticPaths: () => ["colors"],
      },
      {
        path: "sitemap",
        lazy: lazyPage(() => import("./pages/Sitemap")),
        getStaticPaths: () => ["sitemap"],
      },

      // Catch-all
      {
        path: "*",
        lazy: lazyPage(() => import("./pages/NotFound")),
      },
    ],
  },
];

export default routes;
