import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/product";

interface ArtworkLightboxProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

interface Slide {
  url: string;
  caption: string;
  isArtwork: boolean;
}

const HINT_KEY = "artworkLightboxHintShown";

const ArtworkLightbox = ({ product, open, onOpenChange, initialIndex = 0 }: ArtworkLightboxProps) => {
  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = [];
    const seen = new Set<string>();
    const art = (product.image_url || "").trim();
    if (art) {
      seen.add(art);
      out.push({ url: art, caption: "Opera", isArtwork: true });
    }
    for (const s of product.sizes) {
      const u = (s.mock_room_url || "").trim();
      if (!u || seen.has(u)) continue;
      seen.add(u);
      const label = (s.mock_room_label || s.dimensions || "").trim();
      out.push({ url: u, caption: label ? `In ambiente · ${label}` : "In ambiente", isArtwork: false });
    }
    return out;
  }, [product]);

  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setIsMobile(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (open) {
      setIndex(Math.min(initialIndex, Math.max(slides.length - 1, 0)));
      setZoomed(false);
    }
  }, [open, initialIndex, slides.length]);

  // First-time hint per browser session
  useEffect(() => {
    if (!open) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(HINT_KEY) === "1";
      if (!shown) sessionStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
    if (shown) return;
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 2500);
    return () => clearTimeout(t);
  }, [open]);

  // Measure image area
  useLayoutEffect(() => {
    if (!open) return;
    const el = areaRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  useEffect(() => {
    setNatural(null);
  }, [index, open]);

  const count = slides.length;
  const go = (dir: number) => {
    if (count < 2) return;
    setZoomed(false);
    setIndex((i) => (i + dir + count) % count);
  };
  const goTo = (i: number) => {
    setZoomed(false);
    setIndex(i);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || zoomed) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || zoomed) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  const close = () => onOpenChange(false);
  const alt = `${product.name} - vista ingrandita`;
  const slide = slides[index];

  // Displayed (contain) size of the image; scale 1 = whole image visible
  let fitW = 0;
  let fitH = 0;
  let coverScale = 1;
  if (box && natural && natural.w > 0 && natural.h > 0) {
    const fit = Math.min(box.w / natural.w, box.h / natural.h);
    fitW = natural.w * fit;
    fitH = natural.h * fit;
    coverScale = Math.max(box.w / natural.w, box.h / natural.h) / fit;
  }
  const ready = fitW > 0 && fitH > 0;
  const startCover = isMobile && !!slide?.isArtwork && ready;
  const initialScale = startCover ? coverScale : 1;
  const maxScale = Math.max(5, initialScale * 3);

  const roundBtn =
    "flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 bg-black outline-none"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>

          <div
            ref={areaRef}
            className="absolute inset-0 overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {slide && (
              // Hidden loader to learn natural size
              <img
                key={`probe-${slide.url}`}
                src={slide.url}
                alt=""
                aria-hidden
                className="hidden"
                onLoad={(e) =>
                  setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                }
              />
            )}

            {slide && box && ready && (
              <TransformWrapper
                key={`${index}-${open}-${isMobile}-${Math.round(box.w)}x${Math.round(box.h)}`}
                initialScale={initialScale}
                minScale={1}
                maxScale={maxScale}
                centerOnInit
                limitToBounds
                doubleClick={{ mode: "toggle", step: 2 }}
                wheel={{ step: 0.15 }}
                panning={{ disabled: !zoomed && !startCover, velocityDisabled: true }}
                onInit={(ref) => setZoomed(ref.state.scale > 1.01)}
                onTransformed={(_, state) => setZoomed(state.scale > 1.01)}
              >
                {({ zoomIn, zoomOut }) => (
                  <>
                    <TransformComponent
                      wrapperStyle={{ width: box.w, height: box.h }}
                      contentStyle={{ width: box.w, height: box.h }}
                      contentClass="flex items-center justify-center"
                    >
                      <img
                        src={slide.url}
                        alt={alt}
                        style={{ width: fitW, height: fitH }}
                        className="select-none max-w-none"
                        draggable={false}
                      />
                    </TransformComponent>

                    {!isMobile && (
                      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
                        <button
                          type="button"
                          aria-label="Ingrandisci"
                          onClick={() => zoomIn(0.5)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Riduci"
                          onClick={() => zoomOut(0.5)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </TransformWrapper>
            )}
          </div>

          {/* Arrows */}
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Precedente"
                onClick={() => go(-1)}
                className={`group absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-20 ${roundBtn}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white group-hover:bg-black/70">
                  <ChevronLeft className="h-6 w-6" />
                </span>
              </button>
              <button
                type="button"
                aria-label="Successiva"
                onClick={() => go(1)}
                className={`group absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-20 ${roundBtn}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white group-hover:bg-black/70">
                  <ChevronRight className="h-6 w-6" />
                </span>
              </button>
            </>
          )}

          {/* Caption + dots over a soft gradient */}
          {slide && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-12 pb-4 flex flex-col items-center gap-2">
              <span className="text-sm text-white drop-shadow">{slide.caption}</span>
              {count > 1 && (
                <div className="pointer-events-auto flex items-center">
                  {slides.map((s, i) => (
                    <button
                      key={s.url}
                      type="button"
                      aria-label={`Foto ${i + 1} di ${count}`}
                      aria-current={i === index}
                      onClick={() => goTo(i)}
                      className="flex h-8 w-6 items-center justify-center"
                    >
                      <span
                        className={`block h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* First-time hint */}
          <div
            aria-hidden={!showHint}
            className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6 transition-opacity duration-500 ${showHint ? "opacity-100" : "opacity-0"}`}
          >
            <span className="max-w-sm rounded-lg bg-black/70 px-4 py-3 text-center text-sm text-white">
              {isMobile
                ? "Trascina per esplorare · Pizzica per vedere tutta l'opera · Scorri le foto con le frecce"
                : "Rotellina o doppio clic per ingrandire · Frecce per le foto in ambiente"}
            </span>
          </div>

          {/* Close */}
          <DialogPrimitive.Close
            aria-label="Chiudi"
            className={`absolute z-40 ${roundBtn} bg-black/60 text-white hover:bg-black/80`}
            style={
              !isMobile && box && ready
                ? {
                    top: Math.max(8, (box.h - fitH) / 2 - 22),
                    right: Math.max(8, (box.w - fitW) / 2 - 22),
                  }
                : { top: 12, right: 12 }
            }
          >
            <X className="h-7 w-7" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default ArtworkLightbox;
