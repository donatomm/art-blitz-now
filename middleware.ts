// middleware.ts (repo root)
// Routing Middleware must be named middleware.ts and placed at project root. :contentReference[oaicite:1]{index=1}
// We keep this SINGLE FILE to avoid Edge bundling/import issues.

export const config = {
  // Limit where middleware runs (custom matcher config). :contentReference[oaicite:2]{index=2}
  matcher: ["/product/:path*"],
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// UUID -> canonical slug PATH (not full URL). Keys are lowercased UUIDs.
const uuidToSlug: Record<string, string> = {
  "00fe4937-b821-4fc1-a4f4-632da06758c0": "/product/astratto-su-tela-stampa-colori-immagine-nascosta",
  "0e68d751-ae16-4588-9194-716311e56abd": "/product/polpo-abissale-trasparente-stampa-tela",
  "122bb032-8840-4332-9e8c-78f1029f6cbb": "/product/acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas",
  "21a08c61-c91f-4299-9dbf-7003b4c17041": "/product/pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas",
  "341a1409-8ff5-44d5-97db-dabbb6d78749": "/product/polpo-braccia-surreale-inquietante-stampa-tela",
  "365e3f51-c506-4033-8ea0-615454bf130b": "/product/polpo-octopus-blue-wow-stampa-tela",
  "36a8a6eb-64ce-4716-8213-a6ef21c38f73": "/product/ventose-bolle-effetto-cangianti-stampa-tela",
  "382bb540-7e14-4c19-99c0-f20895a04d9b": "/product/polpo-octopus-ventose-rosa-digitale-stampa-tela",
  "3d1ab317-2642-4261-aeb4-a2191f34ae4c": "/product/4-acciughe-sardine-andy.wharol-stampa-tela",
  "623ca5ab-ae26-4281-8f7c-624e820cfbb4": "/product/acciuga-sarda-testa-effetto-colori-stampa-tela-canvas",
  "7adf11a4-bca3-4f08-a0a4-6287753f89f1": "/product/pesce-pescetto-pazzo-stampa-tela-canvas",
  "7b78c90c-9441-429d-a070-a3502a734d72": "/product/Polpo-ventose-stampa-creature-marine",
  "80c3c0b4-7a51-4d40-8022-ef40c7bb4fc7": "/product/trota-salmone-pesce-temporale-stampa-tela-canvas",
  "8342d428-5a1d-47eb-862e-676f43f7ef20": "/product/polpo-octopus-ventose-psichedeliche-stampa-tela",
  "85d82135-89de-4e60-b746-bc0f25df67fe": "/product/Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela",
  "86e8a482-52d9-4640-9ac0-f518a00cceb4": "/product/polpo-octopus-ventose-colori-accesi-stampa-tela",
  "89fb8f7b-f7c7-44f8-bb2a-54452c4d8a2b": "/product/trota-pesce-dettagli-forme-colori-stampa-su-tela",
  "bd62c326-772b-4337-9131-fe10a5e4a2bb": "/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas",
  "c78a95a4-b995-4265-88ce-ee86f014c4d3": "/product/polpo-octopus-effetto-pescato-ventose-stampa-tela",
  "cef4c110-1fa7-444e-9856-1ff96e0494e2": "/product/polpo-octopus-braccia-ventose-stampa-tela",
  "df01b42b-3532-4714-8716-6a8a8895aaa9": "/product/mistero-comfort-food-brodino-stampa-tela",
  "e1a126f3-0fc4-4f9a-a88d-be34e1256683": "/product/sardine-acciughe-gruppo-stampa-tela-alta-qualita",
};

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["product", "<id-or-slug>"]

  // Only handle exactly /product/<something>
  if (parts.length !== 2 || parts[0] !== "product") return;

  const maybeId = parts[1];

  // Only intervene on UUID-looking ids
  if (!UUID_RE.test(maybeId)) return;

  const destPath = uuidToSlug[maybeId.toLowerCase()];

  if (destPath) {
    // Permanent redirect: use 308 (Vercel supports 301 + 308). :contentReference[oaicite:3]{index=3}
    return Response.redirect(new URL(destPath, url.origin), 308);
  }

  // Unknown UUID: gone (prevents homepage soft-404)
  return new Response("Gone", { status: 410 });
}
