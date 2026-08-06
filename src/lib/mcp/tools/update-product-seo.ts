import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_product_seo",
  title: "Update product SEO fields",
  description:
    "Update the SEO title and/or SEO description of a product by slug. Requires an admin account; the artistic name and page content are not changed.",
  inputSchema: {
    slug: z.string().describe("The product slug to update."),
    seo_title: z.string().optional().describe("New SEO title (keep it under 60 characters)."),
    seo_description: z.string().optional().describe("New SEO meta description (keep it under 160 characters)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, seo_title, seo_description }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (seo_title === undefined && seo_description === undefined) {
      return { content: [{ type: "text", text: "Provide seo_title and/or seo_description." }], isError: true };
    }

    const patch: Record<string, string> = {};
    if (seo_title !== undefined) patch.seo_title = seo_title.normalize("NFKC").trim();
    if (seo_description !== undefined) patch.seo_description = seo_description.normalize("NFKC").trim();

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("slug", slug)
      .select("id, slug, seo_title, seo_description");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data || data.length === 0) {
      return {
        content: [{ type: "text", text: `No product updated for slug "${slug}" (not found or not permitted).` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data[0], null, 2) }],
      structuredContent: { product: data[0] },
    };
  },
});
