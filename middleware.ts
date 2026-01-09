export const config = { matcher: ["/product/:path*"] };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Minimal map: enough to fix the indexed UUID + safety net.
// You can add more UUIDs over time.
const uuidToSlug: Record<string, string> = {
  "bd62c326-772b-4337-9131-fe10a5e4a2bb":
    "/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas",
};

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length !== 2 || parts[0] !== "product") return;

  const maybeId = parts[1];
  if (!UUID_RE.test(maybeId)) return;

  const destPath = uuidToSlug[maybeId.toLowerCase()];

  if (destPath) {
    return Response.redirect(new URL(destPath, url.origin), 308);
  }

  return new Response("Gone", { status: 410 });
}
