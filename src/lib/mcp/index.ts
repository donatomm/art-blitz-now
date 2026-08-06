import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import listPagesTool from "./tools/list-pages";
import getPageTool from "./tools/get-page";
import updateProductSeoTool from "./tools/update-product-seo";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "octowonders-com",
  title: "OCTOWONDERS.COM",
  version: "0.1.0",
  instructions:
    "Tools for the OctoWonders art print store. Use `list_products` and `get_product` to inspect the catalogue, `list_pages` and `get_page` for CMS content, and `update_product_seo` to adjust a product's SEO title/description (admin accounts only).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProductsTool, getProductTool, listPagesTool, getPageTool, updateProductSeoTool],
});
