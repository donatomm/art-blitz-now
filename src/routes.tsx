import type { RouteRecord } from "vite-react-ssg";
import Index from "./pages/Index";
import ProductSeo from "./pages/ProductSeo";
import NotFound from "./pages/NotFound";
import { staticProducts } from "@/generated/staticProducts";

export const routes: RouteRecord[] = [
  { path: "/", element: <Index /> },

  {
    path: "/product/:slug",
    element: <ProductSeo />,
    getStaticPaths: () =>
      staticProducts
        .filter((p) => p.slug && p.is_active !== false)
        .map((p) => `/product/${p.slug}`),
  },

  { path: "*", element: <NotFound /> },
];

export default routes;
