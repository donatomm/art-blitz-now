import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description: "List OctoWonders art print products with slug, name, medium and SEO fields.",
  inputSchema: {
    only_active: z.boolean().optional().describe("Only return published products. Defaults to true."),
    search: z.string().optional().describe("Optional case-insensitive filter on the product name."),
    limit: z.number().int().optional().describe("Maximum number of products to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ only_active, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("products")
      .select("id, slug, name, medium, is_active, is_new, display_order, seo_title, seo_description")
      .order("display_order", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));

    if (only_active !== false) query = query.eq("is_active", true);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
