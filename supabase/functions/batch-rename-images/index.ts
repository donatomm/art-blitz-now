import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenameEntry {
  type: string;
  productSlug: string;
  size: string;
  currentFilename: string;
  newFilename: string;
  isOrphan: boolean;
  bucket: string;
  folder: string;
}

interface ProductSize {
  dimensions: string;
  mock_room_url: string;
  price?: number;
}

// Complete rename mapping from XLSX (excluding GIFs and empty new filenames)
const renameMapping: RenameEntry[] = [
  // Linked Artworks
  { type: "Artwork", productSlug: "polpo-octopus-ventose-psichedeliche-stampa-tela", size: "", currentFilename: "1765646030735-2db0vi.webp", newFilename: "Art-Octocups-Antanis-polpo-octopus-ventose-psichedeliche-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-octopus-braccia-ventose-stampa-tela", size: "", currentFilename: "1765274794825-dxcsv.webp", newFilename: "Art-Octoblues-polpo-octopus-braccia-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "sardine-acciughe-gruppo-stampa-tela-alta-qualita", size: "", currentFilename: "1765275016159-ekk6hl.webp", newFilename: "Art-Sardinopsis-sardine-acciughe-gruppo-stampa-tela-alta-qualita.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-octopus-ventose-colori-accesi-stampa-tela", size: "", currentFilename: "1765803698614-octosuckers.webp", newFilename: "Art-Octosuckers-polpo-octopus-ventose-colori-accesi-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-octopus-ventose-rosa-digitale-stampa-tela", size: "", currentFilename: "1765729179765-jw2zyo.webp", newFilename: "Art-Octocups-Kandirosae-polpo-octopus-ventose-rosa-digitale-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-abissale-trasparente-stampa-tela", size: "", currentFilename: "1765305766586-bkbnmf.webp", newFilename: "Art-Octoghost-polpo-abissale-trasparente-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela", size: "", currentFilename: "1765122767907-dfuy2s.webp", newFilename: "Art-OctoCups-Zoensis-Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-octopus-blue-wow-stampa-tela", size: "", currentFilename: "1766457976149-922omg.webp", newFilename: "Art-OCTOBLUE-SUCKERS-polpo-octopus-blue-wow-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "4-acciughe-sardine-andy.wharol-stampa-tela", size: "", currentFilename: "1765803708204-4anchoios.webp", newFilename: "Art-4Anchoios-4-acciughe-sardine-andy.wharol-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-octopus-effetto-pescato-ventose-stampa-tela", size: "", currentFilename: "1765803706311-octopot-linnearis.webp", newFilename: "Art-Octopot-Linnearis-polpo-octopus-effetto-pescato-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas", size: "", currentFilename: "1765508900873-7y2pegk.webp", newFilename: "Art-Anchoio-acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "astratto-su-tela-stampa-colori-immagine-nascosta", size: "", currentFilename: "1765164239909-xgzh77.webp", newFilename: "Art-Daydream-astratto-su-tela-stampa-colori-immagine-nascosta.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "acciuga-sarda-testa-effetto-colori-stampa-tela-canvas", size: "", currentFilename: "1765578359042-ileqpv.webp", newFilename: "Art-Anchoio-Temporalis-acciuga-sarda-testa-effetto-colori-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas", size: "", currentFilename: "1765962393547-ux7h96.webp", newFilename: "Art-OLIM,-QUIDAM-PISCICULI-...-pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "ventose-bolle-effetto-cangianti-stampa-tela", size: "", currentFilename: "1766714079520-j7139a.webp", newFilename: "Art-BOLLOVENTOSE-ventose-bolle-effetto-cangianti-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "polpo-braccia-surreale-inquietante-stampa-tela", size: "", currentFilename: "1765748466486-0270wl.webp", newFilename: "Art-OCTOPUS-EREBUS-polpo-braccia-surreale-inquietante-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "mistero-comfort-food-brodino-stampa-tela", size: "", currentFilename: "1766792762744-iriu7.webp", newFilename: "Art-MINEST-COMFORT-mistero-comfort-food-brodino-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas", size: "", currentFilename: "1767573696906-b6aq2.webp", newFilename: "Art-SALMOTRUTTA-SOLARIS-trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  { type: "Artwork", productSlug: "trota-salmone-pesce-temporale-stampa-tela-canvas", size: "", currentFilename: "1765589957350-cszufo.webp", newFilename: "Art-Salmotrutta-Temporalis-trota-salmone-pesce-temporale-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "artworks" },
  
  // Linked Mockrooms
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-psichedeliche-stampa-tela", size: "75x100", currentFilename: "1765647642248-y9fpn8.webp", newFilename: "Mock-Octocups-Antanis-75x100-polpo-octopus-ventose-psichedeliche-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-psichedeliche-stampa-tela", size: "40x60", currentFilename: "1765724868505-dsb9gn.webp", newFilename: "Mock-Octocups-Antanis-40x60-polpo-octopus-ventose-psichedeliche-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-psichedeliche-stampa-tela", size: "50x75", currentFilename: "1765724880112-4l9xq.webp", newFilename: "Mock-Octocups-Antanis-50x75-polpo-octopus-ventose-psichedeliche-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-psichedeliche-stampa-tela", size: "80x120", currentFilename: "1765724886544-x8ypjj.webp", newFilename: "Mock-Octocups-Antanis-80x120-polpo-octopus-ventose-psichedeliche-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-braccia-ventose-stampa-tela", size: "80x80", currentFilename: "1765128866700-k1n2nt.webp", newFilename: "Mock-Octoblues-80x80-polpo-octopus-braccia-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-braccia-ventose-stampa-tela", size: "60x60", currentFilename: "1765128881504-vr95y.webp", newFilename: "Mock-Octoblues-60x60-polpo-octopus-braccia-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-braccia-ventose-stampa-tela", size: "40x40", currentFilename: "1765128904398-0fmnz.webp", newFilename: "Mock-Octoblues-40x40-polpo-octopus-braccia-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "sardine-acciughe-gruppo-stampa-tela-alta-qualita", size: "80x80", currentFilename: "1765274934936-5d3b5n.webp", newFilename: "Mock-Sardinopsis-80x80-sardine-acciughe-gruppo-stampa-tela-alta-qualita.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "sardine-acciughe-gruppo-stampa-tela-alta-qualita", size: "60x60", currentFilename: "1765275050964-rci969.webp", newFilename: "Mock-Sardinopsis-60x60-sardine-acciughe-gruppo-stampa-tela-alta-qualita.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "sardine-acciughe-gruppo-stampa-tela-alta-qualita", size: "40x40", currentFilename: "1765275585814-sfo6bc.webp", newFilename: "Mock-Sardinopsis-40x40-sardine-acciughe-gruppo-stampa-tela-alta-qualita.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-colori-accesi-stampa-tela", size: "120x80", currentFilename: "1765954252068-ypxkia.webp", newFilename: "Mock-Octosuckers-120x80-polpo-octopus-ventose-colori-accesi-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-colori-accesi-stampa-tela", size: "100x75", currentFilename: "1765954473833-wi195r.webp", newFilename: "Mock-Octosuckers-100x75-polpo-octopus-ventose-colori-accesi-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-colori-accesi-stampa-tela", size: "90x60", currentFilename: "1765954391918-mllonf.webp", newFilename: "Mock-Octosuckers-90x60-polpo-octopus-ventose-colori-accesi-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-rosa-digitale-stampa-tela", size: "75x100", currentFilename: "1766502083670-gudxa.webp", newFilename: "Mock-Octocups-Kandirosae-75x100-polpo-octopus-ventose-rosa-digitale-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-rosa-digitale-stampa-tela", size: "80x120", currentFilename: "1766502097883-e5ruqs.webp", newFilename: "Mock-Octocups-Kandirosae-80x120-polpo-octopus-ventose-rosa-digitale-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-ventose-rosa-digitale-stampa-tela", size: "40x60", currentFilename: "1766502107442-lncysc.webp", newFilename: "Mock-Octocups-Kandirosae-40x60-polpo-octopus-ventose-rosa-digitale-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-abissale-trasparente-stampa-tela", size: "40x60", currentFilename: "1765305813700-0bk1l.webp", newFilename: "Mock-Octoghost-40x60-polpo-abissale-trasparente-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-abissale-trasparente-stampa-tela", size: "75x100", currentFilename: "1765651192462-anmabk.webp", newFilename: "Mock-Octoghost-75x100-polpo-abissale-trasparente-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-abissale-trasparente-stampa-tela", size: "80x120", currentFilename: "1765306158982-mqn6t.webp", newFilename: "Mock-Octoghost-80x120-polpo-abissale-trasparente-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela", size: "60x40", currentFilename: "1765125418442-25i2hl.webp", newFilename: "Mock-OctoCups-Zoensis-60x40-Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela", size: "100x75", currentFilename: "1765125729079-hbkxr8.webp", newFilename: "Mock-OctoCups-Zoensis-100x75-Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela", size: "120x80", currentFilename: "1766800456017-q956e.webp", newFilename: "Mock-OctoCups-Zoensis-120x80-Polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-blue-wow-stampa-tela", size: "100x75", currentFilename: "1766459201392-5f6axhd.webp", newFilename: "Mock-OCTOBLUE-SUCKERS-100x75-polpo-octopus-blue-wow-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-blue-wow-stampa-tela", size: "2x90x60", currentFilename: "1766459213809-psiyb8.webp", newFilename: "Mock-OCTOBLUE-SUCKERS-2x90x60-polpo-octopus-blue-wow-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-blue-wow-stampa-tela", size: "90x60", currentFilename: "1766459227844-87k8w.webp", newFilename: "Mock-OCTOBLUE-SUCKERS-90x60-polpo-octopus-blue-wow-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-blue-wow-stampa-tela", size: "60x40", currentFilename: "1766459243400-g1hew8.webp", newFilename: "Mock-OCTOBLUE-SUCKERS-60x40-polpo-octopus-blue-wow-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-blue-wow-stampa-tela", size: "100x50", currentFilename: "1766613178000-3x0f7b.webp", newFilename: "Mock-OCTOBLUE-SUCKERS-100x50-polpo-octopus-blue-wow-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "4-acciughe-sardine-andy.wharol-stampa-tela", size: "60x60", currentFilename: "1766176292937-u1xu2h.webp", newFilename: "Mock-4Anchoios-60x60-4-acciughe-sardine-andy.wharol-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "4-acciughe-sardine-andy.wharol-stampa-tela", size: "80x80", currentFilename: "1766176180578-yaw1mw.webp", newFilename: "Mock-4Anchoios-80x80-4-acciughe-sardine-andy.wharol-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-pesce-dettagli-forme-colori-stampa-su-tela", size: "60x90", currentFilename: "1765589009510-e3l7kv.webp", newFilename: "Mock-Trotella-Microstigma-60x90-trota-pesce-dettagli-forme-colori-stampa-su-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-pesce-dettagli-forme-colori-stampa-su-tela", size: "75x100", currentFilename: "1765589015036-hw4lj.webp", newFilename: "Mock-Trotella-Microstigma-75x100-trota-pesce-dettagli-forme-colori-stampa-su-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-effetto-pescato-ventose-stampa-tela", size: "80x80", currentFilename: "1765290910636-3hd7e.webp", newFilename: "Mock-Octopot-Linnearis-80x80-polpo-octopus-effetto-pescato-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-effetto-pescato-ventose-stampa-tela", size: "60x60", currentFilename: "1765290921065-yuq7xk.webp", newFilename: "Mock-Octopot-Linnearis-60x60-polpo-octopus-effetto-pescato-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-octopus-effetto-pescato-ventose-stampa-tela", size: "40x40", currentFilename: "1765291544082-yv6i4.webp", newFilename: "Mock-Octopot-Linnearis-40x40-polpo-octopus-effetto-pescato-ventose-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas", size: "60x90", currentFilename: "1766360245689-v9r1z6.webp", newFilename: "Mock-Anchoio-60x90-acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas", size: "75x100", currentFilename: "1766360265925-eni5hn.webp", newFilename: "Mock-Anchoio-75x100-acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas", size: "80x120", currentFilename: "1766360258457-oki3zf.webp", newFilename: "Mock-Anchoio-80x120-acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "astratto-su-tela-stampa-colori-immagine-nascosta", size: "75x50", currentFilename: "1766458103472-ww200r.webp", newFilename: "Mock-Daydream-75x50-astratto-su-tela-stampa-colori-immagine-nascosta.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "astratto-su-tela-stampa-colori-immagine-nascosta", size: "90x60", currentFilename: "1766458115652-5xh3nf.webp", newFilename: "Mock-Daydream-90x60-astratto-su-tela-stampa-colori-immagine-nascosta.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "acciuga-sarda-testa-effetto-colori-stampa-tela-canvas", size: "75x100", currentFilename: "1765591971583-f3m47o.webp", newFilename: "Mock-Anchoio-Temporalis-75x100-acciuga-sarda-testa-effetto-colori-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "acciuga-sarda-testa-effetto-colori-stampa-tela-canvas", size: "50x75", currentFilename: "1765591982153-o88yq.webp", newFilename: "Mock-Anchoio-Temporalis-50x75-acciuga-sarda-testa-effetto-colori-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas", size: "100x75", currentFilename: "1765962465665-6u55rs.webp", newFilename: "Mock-OLIM,-QUIDAM-PISCICULI-...-100x75-pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas", size: "90x60", currentFilename: "1765962520958-v3snk.webp", newFilename: "Mock-OLIM,-QUIDAM-PISCICULI-...-90x60-pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas", size: "60x40", currentFilename: "1765962649548-8xm9t5.webp", newFilename: "Mock-OLIM,-QUIDAM-PISCICULI-...-60x40-pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "ventose-bolle-effetto-cangianti-stampa-tela", size: "100x75", currentFilename: "1766714282187-axy408.webp", newFilename: "Mock-BOLLOVENTOSE-100x75-ventose-bolle-effetto-cangianti-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "ventose-bolle-effetto-cangianti-stampa-tela", size: "60x60", currentFilename: "1766714498140-3iyqe4.webp", newFilename: "Mock-BOLLOVENTOSE-60x60-ventose-bolle-effetto-cangianti-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "ventose-bolle-effetto-cangianti-stampa-tela", size: "80x80", currentFilename: "1766714300469-heokr5.webp", newFilename: "Mock-BOLLOVENTOSE-80x80-ventose-bolle-effetto-cangianti-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "ventose-bolle-effetto-cangianti-stampa-tela", size: "120x60", currentFilename: "1766714514971-ykzlj.webp", newFilename: "Mock-BOLLOVENTOSE-120x60-ventose-bolle-effetto-cangianti-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "ventose-bolle-effetto-cangianti-stampa-tela", size: "90x60", currentFilename: "1766714540555-5453cb.webp", newFilename: "Mock-BOLLOVENTOSE-90x60-ventose-bolle-effetto-cangianti-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-braccia-surreale-inquietante-stampa-tela", size: "40x40", currentFilename: "1765748477732-8n8m45.webp", newFilename: "Mock-OCTOPUS-EREBUS-40x40-polpo-braccia-surreale-inquietante-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "polpo-braccia-surreale-inquietante-stampa-tela", size: "60x60", currentFilename: "1765748496829-bip6r.webp", newFilename: "Mock-OCTOPUS-EREBUS-60x60-polpo-braccia-surreale-inquietante-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "mistero-comfort-food-brodino-stampa-tela", size: "40x60", currentFilename: "1766792779056-v9yygh.webp", newFilename: "Mock-MINEST-COMFORT-40x60-mistero-comfort-food-brodino-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "mistero-comfort-food-brodino-stampa-tela", size: "75x50", currentFilename: "1766792785762-u4lndp.webp", newFilename: "Mock-MINEST-COMFORT-75x50-mistero-comfort-food-brodino-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas", size: "60x40", currentFilename: "1765587633998-6x9wqb.webp", newFilename: "Mock-SALMOTRUTTA-SOLARIS-60x40-trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas", size: "75x50", currentFilename: "1765587638650-5bw1av.webp", newFilename: "Mock-SALMOTRUTTA-SOLARIS-75x50-trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas", size: "100x75", currentFilename: "1765587643972-08cleg.webp", newFilename: "Mock-SALMOTRUTTA-SOLARIS-100x75-trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-salmone-pesce-temporale-stampa-tela-canvas", size: "60x90", currentFilename: "1765588567794-2sb91u.webp", newFilename: "Mock-Salmotrutta-Temporalis-60x90-trota-salmone-pesce-temporale-stampa-tela-canvas.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
  { type: "Mockroom", productSlug: "trota-salmone-pesce-temporale-stampa-tela-canvas", size: "75x100", currentFilename: "1765589968425-xdgyk.webp", newFilename: "Art-Octocups-Antanis-polpo-octopus-ventose-psichedeliche-stampa-tela.webp", isOrphan: false, bucket: "product-images", folder: "mockrooms" },
];

// Orphan images to delete (no new filename means delete)
const orphansToDelete = [
  { bucket: "product-images", folder: "artworks", filename: "1765121236397-2kfhq6.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765122072658-44jw0o.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765122247154-otuyha.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765122387236-nv8lbd.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765122462349-u41ml.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765305613682-m3wvip.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765306378530-a1dgbp.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765464313607-etq6xb.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765571059557-zcyrk.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765580149133-yh5ww6.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765587127985-yfvybu.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765587201148-ulanab.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765587627940-7d0xc5ak.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765587812529-cd39ki.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765588554388-c57eyp.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765588562457-naxfff.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765589003134-18g04m.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765925527902-78h6m7.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765955438775-a0wpa7.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765961450550-z4p4op.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1765962314051-m0ywmg5.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1766188663356-s83ta.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1766713561299-jze0i.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1766713629960-rot1nm.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1766724629722-99mji7.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1766724830071-m5t2sr.webp" },
  { bucket: "product-images", folder: "artworks", filename: "1766725492754-4nh94e.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765112883377-k7h5yn.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765112973831-qokei.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765121251741-cjujw.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765121264459-1ywkn.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765121278664-afxwyd.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765121809921-yick3b.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122192603-h9u8j.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122205647-a5hfi.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122211562-dath0y.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122475159-r9yjzm.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122481580-djn7n7.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122488606-syueo.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122777725-uzuwx.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122784336-3zd05n.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765122790179-s34cvn.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765125430606-g19wp.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765125437352-lpk69.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765126689269-o4j2hq.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765126745505-n3xl3.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765127152683-3nfxs8.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765137809312-d8nq34.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765137845613-7pty68.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765274954719-ca9ezp.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765275394219-6lkywm.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765289385409-1d3b9s.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765289524494-f57ydu.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765289542729-qkhxkl.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765306035144-t52um.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765307001911-uhkwzd.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765307446171-ci3yc4.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765307470162-oupyt5.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765508911570-iums3o.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765508931056-c74ii.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765508952629-hpnero.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765580159510-j5qun.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765580169580-0l7d7c.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765580177022-e8sxj0j.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587143970-i5tm9s.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587162815-vxrqv.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587171338-h0i6gq.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587178771-78zfx9.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587209894-jjp3p7.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587216788-pqgomd.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765587222832-9jf9zv.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765646040271-rx9cj.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765646047465-qfez64.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765646353990-yt9i8.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765647091188-cd8ula.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765647366534-xofq2.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765647626829-35aopw.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765647658071-r558mv.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765723958634-d0gmi6.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765724544220-9kuglw.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765724562649-tcmrn.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765724710966-zlzjl.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765724729529-2pyq5.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765729191346-uhauet.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765729204464-6qurn.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765729210704-gct7n.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765729428232-axt8f4.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765729435926-q02zqo.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765925540287-a9twjm.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765925611645-2mh9qo.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765925665156-sejnc.webp" },
  { bucket: "product-images", folder: "mockrooms", filename: "1765925712363-v7uca.webp" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { success: string[]; errors: string[]; deleted: string[] } = {
      success: [],
      errors: [],
      deleted: [],
    };

    // Process linked images (rename + update DB)
    for (const entry of renameMapping) {
      const oldPath = entry.folder ? `${entry.folder}/${entry.currentFilename}` : entry.currentFilename;
      const newPath = entry.folder ? `${entry.folder}/${entry.newFilename}` : entry.newFilename;

      try {
        // 1. Download original
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(entry.bucket)
          .download(oldPath);

        if (downloadError) {
          results.errors.push(`Download ${oldPath}: ${downloadError.message}`);
          continue;
        }

        // 2. Upload with new name
        const { error: uploadError } = await supabase.storage
          .from(entry.bucket)
          .upload(newPath, fileData, {
            contentType: "image/webp",
            upsert: false,
          });

        if (uploadError) {
          results.errors.push(`Upload ${newPath}: ${uploadError.message}`);
          continue;
        }

        // 3. Delete original
        await supabase.storage.from(entry.bucket).remove([oldPath]);

        // 4. Update database for linked images
        if (!entry.isOrphan && entry.productSlug) {
          const newUrl = `${supabaseUrl}/storage/v1/object/public/${entry.bucket}/${newPath}`;

          if (entry.type === "Artwork") {
            const { error: updateError } = await supabase
              .from("products")
              .update({ image_url: newUrl })
              .eq("slug", entry.productSlug);

            if (updateError) {
              results.errors.push(`DB update artwork ${entry.productSlug}: ${updateError.message}`);
            }
          } else if (entry.type === "Mockroom") {
            // Fetch and update sizes array
            const { data: product } = await supabase
              .from("products")
              .select("sizes")
              .eq("slug", entry.productSlug)
              .maybeSingle();

            if (product?.sizes) {
              const sizes = product.sizes as unknown as ProductSize[];
              const updatedSizes = sizes.map((s) => {
                if (s.mock_room_url?.includes(entry.currentFilename)) {
                  return { ...s, mock_room_url: newUrl };
                }
                return s;
              });

              await supabase
                .from("products")
                .update({ sizes: JSON.parse(JSON.stringify(updatedSizes)) })
                .eq("slug", entry.productSlug);
            }
          }
        }

        results.success.push(`${oldPath} → ${newPath}`);
      } catch (err) {
        results.errors.push(`${oldPath}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Delete orphan images
    for (const orphan of orphansToDelete) {
      const path = orphan.folder ? `${orphan.folder}/${orphan.filename}` : orphan.filename;
      try {
        const { error } = await supabase.storage.from(orphan.bucket).remove([path]);
        if (error) {
          results.errors.push(`Delete orphan ${path}: ${error.message}`);
        } else {
          results.deleted.push(path);
        }
      } catch (err) {
        results.errors.push(`Delete orphan ${path}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Batch rename complete",
        renamed: results.success.length,
        deleted: results.deleted.length,
        errors: results.errors.length,
        details: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
