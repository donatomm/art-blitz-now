import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArtworkLightboxProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

interface Slide {
  url: string;
  isArtwork: boolean;
  sizeLabel: string;
}

const formatSize = (dims: string) => {
  const parts = dims.split(/[x×]/i).map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? `${parts.join(" × ")} cm` : dims.trim();
};

const HAND_PATH =
  "M38 70 L38 16 A6 6 0 0 1 50 16 L50 56 L50 52 A6 6 0 0 1 62 52 L62 58 L62 57 A6 6 0 0 1 74 57 L74 63 L74 63 A5.5 5.5 0 0 1 85 63 L85 86 C85 101 76 112 61 112 L51 112 C41 112 35 107 29 99 L14 79 A6 6 0 0 1 23 70 L38 85 Z";

const HINT_CSS = `
@keyframes awlh-hand{0%{transform:translateX(0)}12.5%{transform:translateX(-40px)}37.5%{transform:translateX(40px)}50%,100%{transform:translateX(0)}}
@keyframes awlh-left{0%,12.4%{opacity:1}12.5%,100%{opacity:0}}
@keyframes awlh-right{0%,12.4%{opacity:0}12.5%,100%{opacity:1}}
@keyframes awlh-swipe{0%,49.9%{opacity:1}50%,100%{opacity:0}}
@keyframes awlh-pinch{0%,49.9%{opacity:0}50%,100%{opacity:1}}
@keyframes awlh-out{0%,50%{transform:translate(0,0)}70%,75%{transform:translate(var(--dx),var(--dy))}75.1%{transform:translate(0,0)}95%,100%{transform:translate(var(--dx),var(--dy))}}
.awlh-hand{animation:awlh-hand 4s ease-in-out forwards}
.awlh-left{animation:awlh-left 4s linear forwards}
.awlh-right{animation:awlh-right 4s linear forwards}
.awlh-swipe{animation:awlh-swipe 4s linear forwards}
.awlh-pinch{animation:awlh-pinch 4s linear forwards}
.awlh-out{animation:awlh-out 4s ease-in-out forwards}
@media (prefers-reduced-motion: reduce){
.awlh-hand,.awlh-left,.awlh-right,.awlh-out{animation:none}
.awlh-right{opacity:0}
}`;

const Arrow = ({ d }: { d: string }) => (
  <>
    <path d={d} fill="none" stroke="#111" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#FFD900" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// Fingertip at (44,10) in hand coords; hand drawn at (50,60) inside a 200x200 box -> fingertip (94,70).
// 0-2 s: hand swipes left then right under a horizontal arrow. 2-4 s: hand still, diagonal arrows move apart twice.
const GestureHint = () => (
  <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden="true" style={{ overflow: "visible" }}>
    <style>{HINT_CSS}</style>
    <g className="awlh-hand">
      <g className="awlh-swipe">
        <g className="awlh-left"><Arrow d="M124 40 L64 40 M76 30 L64 40 L76 50" /></g>
        <g className="awlh-right"><Arrow d="M64 40 L124 40 M112 30 L124 40 L112 50" /></g>
      </g>
      <g transform="translate(50 60) scale(0.75)">
        <path d={HAND_PATH} fill="#fff" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
    <g className="awlh-pinch">
      <g className="awlh-out" style={{ ["--dx" as string]: "12px", ["--dy" as string]: "-12px" }}>
        <Arrow d="M112 52 L140 24 M126 24 L140 24 L140 38" />
      </g>
      <g className="awlh-out" style={{ ["--dx" as string]: "-12px", ["--dy" as string]: "12px" }}>
        <Arrow d="M76 88 L48 116 M48 102 L48 116 L62 116" />
      </g>
    </g>
  </svg>
);
// Termly's cookie banner defaults to z-index 9999 — the viewer must sit above it.
const LIGHTBOX_Z = 100000;

const ArtworkLightbox = ({ product, open, onOpenChange, initialIndex = 0 }: ArtworkLightboxProps) => {
  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = [];
    const art = (product.image_url || "").trim();
    if (art) out.push({ url: art, isArtwork: true, sizeLabel: "" });
    // Same filter and order as the mock room carousel on the product page
    for (const s of product.sizes || []) {
      if (!(s.price > 0)) continue;
      if (!s.dimensions || s.dimensions.trim() === "" || s.dimensions === "0") continue;
      const u = (s.mock_room_url || "").trim();
      if (!u) continue;
      out.push({ url: u, isArtwork: false, sizeLabel: formatSize(s.dimensions) });
    }
    return out;
  }, [product]);

  const isMobile = useIsMobile();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTap = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTouchAt = useRef(0);
  const tfRef = useRef<ReactZoomPanPinchRef | null>(null);


  useEffect(() => {
    if (open) {
      setIndex(Math.min(initialIndex, Math.max(slides.length - 1, 0)));
      setZoomed(false);
    }
  }, [open, initialIndex, slides.length]);

  // Wordless gesture hint: phones, artwork slide, every open
  const hintArtwork = open && isMobile && !!slides[Math.min(initialIndex, Math.max(slides.length - 1, 0))]?.isArtwork;
  useEffect(() => {
    if (!hintArtwork) {
      setShowHint(false);
      return;
    }
    setShowHint(true);
    const stop = () => setShowHint(false);
    const t = setTimeout(stop, 4000);
    const evs = ["touchstart", "pointerdown", "mousedown", "wheel", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, stop, { capture: true, passive: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, stop, { capture: true }));
    };
  }, [hintArtwork]);

  // Measure image area (callback ref: element mounts inside the portal)
  const roRef = useRef<ResizeObserver | null>(null);
  const setArea = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    areaRef.current = el;
    if (!el) return;
    const measure = () =>
      setBox((prev) =>
        prev && prev.w === el.clientWidth && prev.h === el.clientHeight
          ? prev
          : { w: el.clientWidth, h: el.clientHeight },
      );
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    roRef.current = ro;
  }, []);

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

  // Double tap / double click: at scale 1 -> 2.5x centred on the point; above 1 -> back to whole
  const toggleZoomAt = (clientX: number, clientY: number) => {
    const ref = tfRef.current;
    const area = areaRef.current;
    if (!ref || !area) return;
    const { scale, positionX, positionY } = ref.state;
    if (scale > 1.01) {
      ref.resetTransform(200);
      return;
    }
    const rect = area.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const k = 2.5 / scale;
    let x = px - (px - positionX) * k;
    let y = py - (py - positionY) * k;
    // Keep the zoomed image covering the area where possible
    const w = area.clientWidth * 2.5;
    const h = area.clientHeight * 2.5;
    x = Math.min(0, Math.max(area.clientWidth - w, x));
    y = Math.min(0, Math.max(area.clientHeight - h, y));
    ref.setTransform(x, y, 2.5, 200);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) {
      touchStart.current = null;
      lastTap.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    lastTouchAt.current = Date.now();
    const cx = e.changedTouches[0].clientX;
    const cy = e.changedTouches[0].clientY;
    const dx = cx - start.x;
    const dy = cy - start.y;
    // Tap (no movement): check for double tap
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - start.t < 300) {
      const prev = lastTap.current;
      const now = Date.now();
      if (prev && now - prev.t < 300 && Math.abs(cx - prev.x) < 30 && Math.abs(cy - prev.y) < 30) {
        lastTap.current = null;
        toggleZoomAt(cx, cy);
      } else {
        lastTap.current = { x: cx, y: cy, t: now };
      }
      return;
    }
    lastTap.current = null;
    if (zoomed) return;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };
  const onDoubleClick = (e: React.MouseEvent) => {
    if (Date.now() - lastTouchAt.current < 800) return; // already handled as touch
    if ((e.target as HTMLElement).closest("button")) return;
    toggleZoomAt(e.clientX, e.clientY);
  };

  const close = () => onOpenChange(false);
  const alt = `${product.name} - vista ingrandita`;
  const slide = slides[index];

  // Displayed (contain) size of the image; scale 1 = whole image visible
  let fitW = 0;
  let fitH = 0;
  if (box && natural && natural.w > 0 && natural.h > 0) {
    const fit = Math.min(box.w / natural.w, box.h / natural.h);
    fitW = natural.w * fit;
    fitH = natural.h * fit;
  }
  const ready = fitW > 0 && fitH > 0;

  const roundBtn =
    "flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black" style={{ zIndex: LIGHTBOX_Z }} />
        <DialogPrimitive.Content
          className="fixed inset-0 bg-black outline-none"
          style={{ zIndex: LIGHTBOX_Z + 1 }}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>

          <div
            ref={setArea}
            className="absolute inset-0 overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onDoubleClick={onDoubleClick}
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
                ref={tfRef}
                key={`${index}-${open}-${isMobile}-${Math.round(box.w)}x${Math.round(box.h)}`}
                initialScale={1}
                minScale={1}
                maxScale={5}
                centerOnInit
                limitToBounds
                doubleClick={{ disabled: true }}
                wheel={{ step: 0.15 }}
                panning={{ disabled: !zoomed, velocityDisabled: true }}
                onInit={(ref) => setZoomed(ref.state.scale > 1.01)}
                onTransform={(_, state) => setZoomed(state.scale > 1.01)}
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
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white" style={{ background: "#FFD900", boxShadow: "0 2px 8px rgba(0,0,0,.45)" }}>
                  <ChevronLeft className="h-6 w-6" color="#111" strokeWidth={3} />
                </span>
              </button>
              <button
                type="button"
                aria-label="Successiva"
                onClick={() => go(1)}
                className={`group absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-20 ${roundBtn}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white" style={{ background: "#FFD900", boxShadow: "0 2px 8px rgba(0,0,0,.45)" }}>
                  <ChevronRight className="h-6 w-6" color="#111" strokeWidth={3} />
                </span>
              </button>
            </>
          )}

          {/* Size label on room photos */}
          {slide && !slide.isArtwork && slide.sizeLabel && box && ready && !zoomed && (
            <span
              className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-full text-white"
              style={{
                top: Math.max(0, (box.h - fitH) / 2) + 12,
                left: "50%",
                fontSize: 13,
                letterSpacing: "0.04em",
                background: "rgba(0,0,0,.55)",
                padding: "4px 12px",
                border: "1.5px solid #fff",
              }}
            >
              {slide.sizeLabel}
            </span>
          )}

          {/* Dots */}
          {slide && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-4 flex flex-col items-center gap-2">
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

          {/* Gesture hint (phones, artwork slide) */}
          {showHint && slide?.isArtwork && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <GestureHint />
            </div>
          )}

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
