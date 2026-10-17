import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface ArtworkLightboxProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
  /** If given, "Scegli il formato" calls this instead of linking to the product page. */
  onChooseFormat?: () => void;
}

const ArtworkLightbox = ({ product, open, onOpenChange, initialIndex = 0, onChooseFormat }: ArtworkLightboxProps) => {
  const slides = useMemo(() => {
    const urls = [product.image_url, ...product.sizes.map((s) => s.mock_room_url || "")]
      .map((u) => (u || "").trim())
      .filter(Boolean);
    return Array.from(new Set(urls));
  }, [product]);

  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) {
      setIndex(Math.min(initialIndex, Math.max(slides.length - 1, 0)));
      setZoomed(false);
    }
  }, [open, initialIndex, slides.length]);

  const count = slides.length;
  const go = (dir: number) => {
    if (count < 2) return;
    setZoomed(false);
    setIndex((i) => (i + dir + count) % count);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col bg-black outline-none"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>

          <div
            className="relative flex-1 min-h-0 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {count > 0 && (
              <TransformWrapper
                key={`${index}-${open}`}
                minScale={1}
                maxScale={5}
                doubleClick={{ mode: "toggle", step: 2 }}
                panning={{ disabled: !zoomed }}
                onTransform={(_, state) => setZoomed(state.scale > 1.01)}
              >
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  <img
                    src={slides[index]}
                    alt={alt}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TransformComponent>
              </TransformWrapper>
            )}

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Precedente"
                  onClick={() => go(-1)}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  aria-label="Successiva"
                  onClick={() => go(1)}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <DialogPrimitive.Close
              aria-label="Chiudi"
              className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-7 w-7" />
            </DialogPrimitive.Close>
          </div>

          <div
            className="flex flex-col items-center gap-2 py-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            {count > 1 && (
              <span className="text-xs text-white/70">
                {index + 1} / {count}
              </span>
            )}
            {onChooseFormat ? (
              <Button variant="cta" onClick={onChooseFormat}>
                Scegli il formato
              </Button>
            ) : (
              <Button variant="cta" asChild>
                <Link to={`/product/${product.slug}#acquista`} onClick={close}>
                  Scegli il formato
                </Link>
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default ArtworkLightbox;
