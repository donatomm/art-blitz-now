// middleware.ts
// Vercel Routing Middleware works with any framework and must live at project root. :contentReference[oaicite:1]{index=1}
// We only intercept /product/<uuid> and:
// - if uuid is known -> 308 permanent redirect to the slug URL :contentReference[oaicite:2]{index=2}
// - if uuid is unknown -> 410 Gone (prevents “product UUID shows homepage” soft-404 nonsense)

import { uuidToSlug } from "./uuid-to-slug";

export const config = {
  // Limit where middleware runs (custom matcher config). :contentReference[oaicite:3]{index=3}
  matcher: ["/product/:path*"],
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["product", "<id-or-slug>"]

  // Only handle exactly /product/<something>
  if (parts.length !== 2 || parts[0] !== "product") return;

  const maybeId = parts[1];

  // Only intervene for UUID-looking IDs
  if (!UUID_RE.test(maybeId)) return;

  const key = maybeId.toLowerCase();
  const destPath = uuidToSlug[key];

  if (destPath) {
    // 308 permanent redirect (SEO-safe, cached; preserves method/body). :contentReference[oaicite:4]{index=4}
    return Response.redirect(new URL(destPath, url.origin), 308);
  }

  // Unknown UUID: gone for good
  return new Response("Gone", { status: 410 });
}
